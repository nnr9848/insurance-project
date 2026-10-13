package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.AgentProfile;
import com.aadhiraksha.insurance.model.Client;
import com.aadhiraksha.insurance.model.PospCommission;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.AgentProfileRepository;
import com.aadhiraksha.insurance.repository.ClientRepository;
import com.aadhiraksha.insurance.repository.PospCommissionRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PospService {

    private final AgentProfileRepository agentProfileRepository;
    private final PospCommissionRepository pospCommissionRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final com.aadhiraksha.insurance.repository.ClientOpportunityRepository clientOpportunityRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getPospDashboard(User user) {
        Map<String, Object> response = new HashMap<>();

        Optional<AgentProfile> profileOpt = agentProfileRepository.findByUserId(user.getId());
        AgentProfile profile = profileOpt.orElse(null);

        BigDecimal totalGross = pospCommissionRepository.getTotalGrossPremiumForAgent(user.getId());
        BigDecimal totalEarned = pospCommissionRepository.getTotalEarningsForAgent(user.getId());
        BigDecimal totalPaid = pospCommissionRepository.getTotalPaidForAgent(user.getId());
        BigDecimal pendingPayout = pospCommissionRepository.getPendingPayoutForAgent(user.getId());
        Long policiesSold = pospCommissionRepository.countPoliciesSoldByAgent(user.getId());
        long attributedClientsCount = clientRepository.countByPospAgentId(user.getId());

        List<PospCommission> recentCommissions = pospCommissionRepository.findByPospAgentIdOrderByCreatedAtDesc(user.getId());
        if (recentCommissions.size() > 5) {
            recentCommissions = recentCommissions.subList(0, 5);
        }

        response.put("agentId", user.getId());
        response.put("agentName", user.getFullName());
        response.put("agentEmail", user.getEmail());
        response.put("agentPhone", user.getPhoneNumber());
        response.put("profile", profile);
        response.put("totalGrossPremium", totalGross != null ? totalGross : BigDecimal.ZERO);
        response.put("totalEarnings", totalEarned != null ? totalEarned : BigDecimal.ZERO);
        response.put("totalPaid", totalPaid != null ? totalPaid : BigDecimal.ZERO);
        response.put("pendingPayout", pendingPayout != null ? pendingPayout : BigDecimal.ZERO);
        response.put("policiesSoldCount", policiesSold != null ? policiesSold : 0L);
        response.put("attributedClientsCount", attributedClientsCount);
        response.put("recentCommissions", recentCommissions);

        return response;
    }

    @Transactional(readOnly = true)
    public List<PospCommission> getAgentCommissions(Long agentId) {
        return pospCommissionRepository.findByPospAgentIdOrderByCreatedAtDesc(agentId);
    }

    @Transactional(readOnly = true)
    public List<Client> getAgentClients(Long agentId) {
        return clientRepository.findByPospAgentIdOrderByUpdatedAtDesc(agentId);
    }

    @Transactional
    public PospCommission bookPolicy(User agentUser, Map<String, Object> payload) {
        String clientName = (String) payload.get("clientName");
        String phoneNumber = (String) payload.get("phoneNumber");
        String email = (String) payload.get("email");
        String productType = (String) payload.getOrDefault("productType", "MOTOR");
        String insurerName = (String) payload.getOrDefault("insurerName", "HDFC ERGO General Insurance");
        String policyNumber = (String) payload.getOrDefault("policyNumber", "POL-" + System.currentTimeMillis() % 1000000);
        
        BigDecimal grossPremium;
        try {
            grossPremium = new BigDecimal(payload.get("grossPremium").toString());
        } catch (Exception e) {
            grossPremium = new BigDecimal("10000.00");
        }

        BigDecimal ratePercent;
        try {
            if (payload.containsKey("commissionRatePercent") && payload.get("commissionRatePercent") != null) {
                ratePercent = new BigDecimal(payload.get("commissionRatePercent").toString());
            } else {
                ratePercent = new BigDecimal("15.00");
            }
        } catch (Exception e) {
            ratePercent = new BigDecimal("15.00");
        }

        // Calculate commission
        BigDecimal grossComm = grossPremium.multiply(ratePercent).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal tds = grossComm.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP); // 5% standard Section 194H TDS
        BigDecimal net = grossComm.subtract(tds);

        // Find or create Client
        List<Client> existing = clientRepository.findByPhoneSuffix(phoneNumber.length() > 10 ? phoneNumber.substring(phoneNumber.length() - 10) : phoneNumber);
        Client client;
        if (!existing.isEmpty()) {
            client = existing.get(0);
            if (client.getPospAgent() == null) {
                client.setPospAgent(agentUser);
            }
            client.setStage("POLICY_ISSUED");
            client.setEstimatedPremium(grossPremium);
            client.setExistingInsurer(insurerName);
            client.setInsuranceType(productType);
            clientRepository.save(client);
        } else {
            client = Client.builder()
                    .clientCode("CL-P" + (System.currentTimeMillis() % 100000))
                    .fullName(clientName != null ? clientName : "Client " + phoneNumber)
                    .phoneNumber(phoneNumber)
                    .email(email)
                    .insuranceType(productType)
                    .existingInsurer(insurerName)
                    .estimatedPremium(grossPremium)
                    .leadSource("POSP_DIRECT")
                    .stage("POLICY_ISSUED")
                    .priority("HIGH")
                    .pospAgent(agentUser)
                    .notes("Booked directly via POSP Partner Portal by " + agentUser.getFullName())
                    .build();
            client = clientRepository.save(client);
        }

        // Create Commission Ledger Entry
        PospCommission comm = PospCommission.builder()
                .pospAgent(agentUser)
                .client(client)
                .policyNumber(policyNumber)
                .insurerName(insurerName)
                .productType(productType)
                .grossPremium(grossPremium)
                .commissionRatePercent(ratePercent)
                .commissionAmount(grossComm)
                .tdsDeducted(tds)
                .netPayout(net)
                .payoutStatus("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return pospCommissionRepository.save(comm);
    }

    @Transactional
    public AgentProfile updateAgentProfile(User user, Map<String, Object> payload) {
        AgentProfile profile = agentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> AgentProfile.builder()
                        .user(user)
                        .panNumber("PENDING")
                        .build());

        if (payload.containsKey("panNumber")) profile.setPanNumber((String) payload.get("panNumber"));
        if (payload.containsKey("city")) profile.setCity((String) payload.get("city"));
        if (payload.containsKey("state")) profile.setState((String) payload.get("state"));
        if (payload.containsKey("bankName")) profile.setBankName((String) payload.get("bankName"));
        if (payload.containsKey("bankAccountNumber")) profile.setBankAccountNumber((String) payload.get("bankAccountNumber"));
        if (payload.containsKey("ifscCode")) profile.setIfscCode((String) payload.get("ifscCode"));
        if (payload.containsKey("photoUrl")) profile.setPhotoUrl((String) payload.get("photoUrl"));

        return agentProfileRepository.save(profile);
    }

    @Transactional
    public AgentProfile uploadAgentDocument(User user, String docType, String fileUrl) {
        AgentProfile profile = agentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> AgentProfile.builder()
                        .user(user)
                        .panNumber("PENDING")
                        .build());

        switch (docType.toUpperCase().trim()) {
            case "PHOTO":
                profile.setPhotoUrl(fileUrl);
                break;
            case "PAN":
                profile.setPanDocUrl(fileUrl);
                break;
            case "AADHAAR":
                profile.setAadhaarDocUrl(fileUrl);
                break;
            case "EDUCATION":
                profile.setEducationCertificateUrl(fileUrl);
                break;
            case "CHEQUE":
                profile.setCancelledChequeUrl(fileUrl);
                break;
            case "TRAINING":
                profile.setTrainingCertificateUrl(fileUrl);
                break;
            default:
                throw new IllegalArgumentException("Unknown document type: " + docType);
        }

        // Marking documents as uploaded leaves verification to Admin review
        return agentProfileRepository.save(profile);
    }

    @Transactional
    public Client addClient(User agentUser, Map<String, Object> payload) {
        String fullName = (String) payload.get("fullName");
        String phoneNumber = (String) payload.get("phoneNumber");
        String email = (String) payload.get("email");
        String insuranceType = payload.get("insuranceType") != null ? payload.get("insuranceType").toString() : "HEALTH";
        String existingInsurer = (String) payload.get("existingInsurer");
        String notes = (String) payload.get("notes");
        String stage = payload.get("stage") != null ? payload.get("stage").toString() : "PROPOSAL_SHARED";

        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Client phone number is mandatory");
        }

        BigDecimal estimatedPremium = BigDecimal.ZERO;
        if (payload.get("estimatedPremium") != null) {
            try {
                estimatedPremium = new BigDecimal(payload.get("estimatedPremium").toString());
            } catch (Exception ignored) {}
        }

        List<Client> existing = clientRepository.findByPhoneSuffix(phoneNumber.length() > 10 ? phoneNumber.substring(phoneNumber.length() - 10) : phoneNumber);
        if (!existing.isEmpty()) {
            Client c = existing.get(0);
            if (c.getPospAgent() == null) {
                c.setPospAgent(agentUser);
            }
            // Non-destructive preservation: Only fill empty email/fields; NEVER overwrite existing name or active policy
            if ((c.getEmail() == null || c.getEmail().isBlank()) && email != null) {
                c.setEmail(email);
            }
            
            // Append inquiry details to notes history
            String noteAppend = "\n[" + java.time.LocalDate.now() + "] Ingested " + insuranceType + " opportunity via POSP portal" + 
                    (notes != null ? ": " + notes : "");
            String curNotes = c.getNotes() != null ? c.getNotes() : "";
            c.setNotes((curNotes + noteAppend).trim());
            Client savedClient = clientRepository.save(c);

            // Create a child opportunity in the client's multi-product portfolio
            Map<String, Object> specsMap = new HashMap<>();
            if (existingInsurer != null) specsMap.put("insurerName", existingInsurer);
            specsMap.put("insuranceLine", insuranceType);
            if (estimatedPremium.compareTo(BigDecimal.ZERO) > 0) specsMap.put("estimatedPremium", "₹" + estimatedPremium);

            String specsJson = "{}";
            try {
                specsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(specsMap);
            } catch (Exception ignored) {}

            String displayCoverage = (c.getSumInsured() != null && !c.getSumInsured().isBlank()) ? c.getSumInsured() : "₹10,00,000";

            com.aadhiraksha.insurance.model.ClientOpportunity opp = com.aadhiraksha.insurance.model.ClientOpportunity.builder()
                    .client(savedClient)
                    .categorySlug(insuranceType)
                    .productName((existingInsurer != null ? existingInsurer + " - " : "") + insuranceType + " Insurance")
                    .coverageAmount(displayCoverage)
                    .estimatedPremium(estimatedPremium)
                    .stage(stage != null ? stage : "PROPOSAL_SHARED")
                    .priority("MEDIUM")
                    .isPrimary(false)
                    .assignedAdvisor(agentUser)
                    .specs(specsJson)
                    .notes(notes != null ? notes : "Added via POSP partner portal lead ingestion")
                    .build();
            clientOpportunityRepository.save(opp);

            return savedClient;
        }

        Client client = Client.builder()
                .clientCode("CL-P" + (System.currentTimeMillis() % 100000))
                .fullName(fullName != null && !fullName.trim().isEmpty() ? fullName : "Client " + phoneNumber)
                .phoneNumber(phoneNumber)
                .email(email)
                .insuranceType(insuranceType)
                .existingInsurer(existingInsurer)
                .estimatedPremium(estimatedPremium)
                .sumInsured("₹10,00,000")
                .leadSource("POSP_DIRECT")
                .stage(stage)
                .priority("MEDIUM")
                .pospAgent(agentUser)
                .notes(notes != null ? notes : "Introduced by POSP Partner " + agentUser.getFullName())
                .build();

        Client savedClient = clientRepository.save(client);

        // Also create primary opportunity for the newly created client
        Map<String, Object> primarySpecsMap = new HashMap<>();
        if (existingInsurer != null) primarySpecsMap.put("insurerName", existingInsurer);
        primarySpecsMap.put("insuranceLine", insuranceType);
        if (estimatedPremium.compareTo(BigDecimal.ZERO) > 0) primarySpecsMap.put("estimatedPremium", "₹" + estimatedPremium);

        String primarySpecsJson = "{}";
        try {
            primarySpecsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(primarySpecsMap);
        } catch (Exception ignored) {}

        com.aadhiraksha.insurance.model.ClientOpportunity primaryOpp = com.aadhiraksha.insurance.model.ClientOpportunity.builder()
                .client(savedClient)
                .categorySlug(insuranceType)
                .productName((existingInsurer != null ? existingInsurer + " - " : "") + insuranceType + " Insurance")
                .coverageAmount("₹10,00,000")
                .estimatedPremium(estimatedPremium)
                .stage(stage != null ? stage : "PROPOSAL_SHARED")
                .priority("MEDIUM")
                .isPrimary(true)
                .assignedAdvisor(agentUser)
                .specs(primarySpecsJson)
                .notes(notes != null ? notes : "Primary policy opportunity")
                .build();
        clientOpportunityRepository.save(primaryOpp);

        return savedClient;
    }
}
