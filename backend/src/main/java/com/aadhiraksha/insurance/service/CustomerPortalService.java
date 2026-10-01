package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.Claim;
import com.aadhiraksha.insurance.model.Client;
import com.aadhiraksha.insurance.model.ClientDocument;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClaimRepository;
import com.aadhiraksha.insurance.repository.ClientDocumentRepository;
import com.aadhiraksha.insurance.repository.ClientRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerPortalService {

    private final ClientRepository clientRepository;
    private final ClientDocumentRepository clientDocumentRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Map<String, Object> getCustomerDashboard(User user) {
        Map<String, Object> response = new HashMap<>();

        // 1. Fetch user's registered master client record(s)
        List<Client> clientRecords = clientRepository.findByCustomerUserIdOrderByUpdatedAtDesc(user.getId());
        if (clientRecords.isEmpty()) {
            // Fallback match by phone number if direct relation not set yet
            String phone = user.getPhoneNumber();
            if (phone != null && !phone.isBlank()) {
                String cleanPhone = phone.replaceAll("[^0-9]", "");
                if (cleanPhone.length() >= 10) {
                    clientRecords = clientRepository.findByPhoneSuffix(cleanPhone.substring(cleanPhone.length() - 10));
                }
            }
        }

        // 2. Fetch customer's uploaded or assigned documents
        List<ClientDocument> documents = clientDocumentRepository.findByCustomerUserId(user.getId());

        // 3. Fetch customer claims
        List<Claim> claims = new ArrayList<>();
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            claims.addAll(claimRepository.findByContactPhoneOrderByCreatedAtDesc(user.getPhoneNumber()));
        }
        for (Client c : clientRecords) {
            if (c.getClientCode() != null) {
                List<Claim> byCode = claimRepository.findByPolicyNumberOrderByCreatedAtDesc(c.getClientCode());
                for (Claim cl : byCode) {
                    if (claims.stream().noneMatch(existing -> existing.getId().equals(cl.getId()))) {
                        claims.add(cl);
                    }
                }
            }
        }

        response.put("user", Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : ""
        ));
        response.put("policies", clientRecords);
        response.put("documents", documents);
        response.put("claims", claims);
        
        // Assigned Advisor contact card
        User assignedAdvisor = null;
        for (Client c : clientRecords) {
            if (c.getAssignedAdvisor() != null) {
                assignedAdvisor = c.getAssignedAdvisor();
                break;
            }
        }
        if (assignedAdvisor != null) {
            response.put("assignedAdvisor", Map.of(
                    "name", assignedAdvisor.getFullName(),
                    "email", assignedAdvisor.getEmail() != null ? assignedAdvisor.getEmail() : "",
                    "phoneNumber", assignedAdvisor.getPhoneNumber() != null ? assignedAdvisor.getPhoneNumber() : "",
                    "designation", assignedAdvisor.getDesignation() != null ? assignedAdvisor.getDesignation() : "Senior Insurance Advisor"
            ));
        } else {
            response.put("assignedAdvisor", null);
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<Client> getMyPolicies(User user) {
        List<Client> policies = clientRepository.findByCustomerUserIdOrderByUpdatedAtDesc(user.getId());
        if (policies.isEmpty() && user.getPhoneNumber() != null) {
            String clean = user.getPhoneNumber().replaceAll("[^0-9]", "");
            if (clean.length() >= 10) {
                policies = clientRepository.findByPhoneSuffix(clean.substring(clean.length() - 10));
            }
        }
        return policies;
    }

    @Transactional(readOnly = true)
    public List<ClientDocument> getMyDocuments(User user) {
        return clientDocumentRepository.findByCustomerUserId(user.getId());
    }

    @Transactional
    public ClientDocument uploadMyDocument(User user, Map<String, Object> payload) {
        String docType = (String) payload.getOrDefault("documentType", "OTHER");
        String fileName = (String) payload.getOrDefault("fileName", "Document_" + System.currentTimeMillis() + ".pdf");
        String fileUrl = (String) payload.getOrDefault("fileUrl", "");
        String fileType = (String) payload.getOrDefault("fileType", "application/pdf");
        Long sizeBytes = 0L;
        if (payload.get("fileSizeBytes") != null) {
            try {
                sizeBytes = Long.valueOf(payload.get("fileSizeBytes").toString());
            } catch (Exception ignored) {}
        }

        // Find or link client
        Optional<Client> clientOpt = clientRepository.findFirstByCustomerUserId(user.getId());
        Client client;
        if (clientOpt.isPresent()) {
            client = clientOpt.get();
        } else {
            // Find by phone
            List<Client> byPhone = user.getPhoneNumber() != null ? clientRepository.findByPhoneSuffix(user.getPhoneNumber().length() >= 10 ? user.getPhoneNumber().substring(user.getPhoneNumber().length() - 10) : user.getPhoneNumber()) : Collections.emptyList();
            if (!byPhone.isEmpty()) {
                client = byPhone.get(0);
                client.setCustomerUser(user);
                clientRepository.save(client);
            } else {
                // Auto-create client container for document
                client = Client.builder()
                        .clientCode("CL-U" + (System.currentTimeMillis() % 100000))
                        .fullName(user.getFullName())
                        .phoneNumber(user.getPhoneNumber() != null ? user.getPhoneNumber() : "0000000000")
                        .email(user.getEmail())
                        .customerUser(user)
                        .stage("DOCUMENTS")
                        .leadSource("PORTAL_SELF_SERVICE")
                        .notes("Self-registered portal customer.")
                        .build();
                client = clientRepository.save(client);
            }
        }

        ClientDocument doc = ClientDocument.builder()
                .client(client)
                .documentType(docType)
                .fileName(fileName)
                .fileUrl(fileUrl)
                .fileSizeBytes(sizeBytes)
                .fileType(fileType)
                .verificationStatus("PENDING_REVIEW")
                .uploadedBy(user)
                .build();

        ClientDocument saved = clientDocumentRepository.save(doc);

        // Advance client stage if in early funnel
        if ("NEW_LEAD".equals(client.getStage()) || "CONTACTED".equals(client.getStage()) || "FOLLOWUP".equals(client.getStage())) {
            client.setStage("DOCUMENTS");
            clientRepository.save(client);
        }

        auditService.logAction(
                "CLIENT",
                client.getId(),
                "DOCUMENT_UPLOAD",
                "Digital KYC Vault",
                null,
                "Customer self-uploaded " + docType + " (" + fileName + ") via Customer Portal",
                user,
                null
        );

        return saved;
    }
}
