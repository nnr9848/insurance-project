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
}
