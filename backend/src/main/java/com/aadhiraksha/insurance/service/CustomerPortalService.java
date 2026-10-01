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
    private final FileStorageService fileStorageService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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

        Map<String, Object> userProfile = new HashMap<>();
        userProfile.put("id", user.getId());
        userProfile.put("fullName", user.getFullName());
        userProfile.put("email", user.getEmail() != null ? user.getEmail() : "");
        userProfile.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
        if (!clientRecords.isEmpty()) {
            Client primary = clientRecords.get(0);
            userProfile.put("city", primary.getCity() != null ? primary.getCity() : "");
            userProfile.put("state", primary.getState() != null ? primary.getState() : "");
            userProfile.put("pincode", primary.getPincode() != null ? primary.getPincode() : "");
            userProfile.put("whatsappNumber", primary.getWhatsappNumber() != null ? primary.getWhatsappNumber() : "");
        } else {
            userProfile.put("city", "");
            userProfile.put("state", "");
            userProfile.put("pincode", "");
            userProfile.put("whatsappNumber", "");
        }

        response.put("user", userProfile);
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

    @Transactional
    public ClientDocument uploadMyDocumentMultipart(User user, org.springframework.web.multipart.MultipartFile file, String documentType, String displayTitle) {
        String originalFilename = file.getOriginalFilename();
        String storedFileName = fileStorageService.storeFile(file, originalFilename);
        
        String effectiveDocType = (documentType != null && !documentType.isBlank()) ? documentType : "OTHER";
        String effectiveTitle = (displayTitle != null && !displayTitle.isBlank()) ? displayTitle : (originalFilename != null ? originalFilename : "Document_" + System.currentTimeMillis());
        String contentType = file.getContentType() != null ? file.getContentType() : "application/pdf";
        long size = file.getSize();

        // Find or link client
        Optional<Client> clientOpt = clientRepository.findFirstByCustomerUserId(user.getId());
        Client client;
        if (clientOpt.isPresent()) {
            client = clientOpt.get();
        } else {
            List<Client> byPhone = user.getPhoneNumber() != null ? clientRepository.findByPhoneSuffix(user.getPhoneNumber().length() >= 10 ? user.getPhoneNumber().substring(user.getPhoneNumber().length() - 10) : user.getPhoneNumber()) : Collections.emptyList();
            if (!byPhone.isEmpty()) {
                client = byPhone.get(0);
                client.setCustomerUser(user);
                clientRepository.save(client);
            } else {
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
                .documentType(effectiveDocType)
                .fileName(effectiveTitle)
                .fileUrl("/api/customer/documents/view-file/" + storedFileName)
                .fileSizeBytes(size)
                .fileType(contentType)
                .verificationStatus("PENDING_REVIEW")
                .uploadedBy(user)
                .build();

        ClientDocument saved = clientDocumentRepository.save(doc);

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
                "Customer deposited " + effectiveDocType + " (" + effectiveTitle + ") into secure vault",
                user,
                null
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public ClientDocument getCustomerDocumentById(User user, Long docId) {
        ClientDocument doc = clientDocumentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + docId));

        boolean isOwner = (doc.getClient() != null && doc.getClient().getCustomerUser() != null && doc.getClient().getCustomerUser().getId().equals(user.getId()))
                || (doc.getUploadedBy() != null && doc.getUploadedBy().getId().equals(user.getId()));

        if (!isOwner) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to view this document");
        }

        return doc;
    }

    @Transactional
    public void deleteMyDocument(User user, Long docId) {
        ClientDocument doc = getCustomerDocumentById(user, docId);

        // Compliance guard: Verified documents cannot be deleted directly by customer
        if ("VERIFIED".equalsIgnoreCase(doc.getVerificationStatus())) {
            throw new IllegalStateException("Approved and verified KYC/Policy documents cannot be deleted directly. Please contact your dedicated insurance advisor to request a revision.");
        }

        // Clean up physical file if stored locally
        if (doc.getFileUrl() != null && doc.getFileUrl().contains("/view-file/")) {
            String fileName = doc.getFileUrl().substring(doc.getFileUrl().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(fileName);
        }

        // Audit log
        auditService.logAction(
                "CLIENT",
                doc.getClient() != null ? doc.getClient().getId() : null,
                "DOCUMENT_DELETE",
                "Digital KYC Vault",
                doc.getFileName(),
                null,
                user,
                null
        );

        clientDocumentRepository.delete(doc);
    }

    @Transactional
    public ClientDocument renameMyDocument(User user, Long docId, String newTitle, String newCategory) {
        ClientDocument doc = getCustomerDocumentById(user, docId);

        if ("VERIFIED".equalsIgnoreCase(doc.getVerificationStatus())) {
            throw new IllegalStateException("Verified documents cannot be renamed. Please contact your advisor.");
        }

        if (newTitle != null && !newTitle.isBlank()) {
            doc.setFileName(newTitle.trim());
        }
        if (newCategory != null && !newCategory.isBlank()) {
            doc.setDocumentType(newCategory.trim());
        }

        auditService.logAction(
                "CLIENT",
                doc.getClient() != null ? doc.getClient().getId() : null,
                "DOCUMENT_UPDATE",
                "Digital KYC Vault",
                null,
                "Customer updated document metadata: " + doc.getFileName(),
                user,
                null
        );

        return clientDocumentRepository.save(doc);
    }

    @Transactional
    public ClientDocument replaceMyDocument(User user, Long docId, org.springframework.web.multipart.MultipartFile newFile) {
        ClientDocument doc = getCustomerDocumentById(user, docId);

        if ("VERIFIED".equalsIgnoreCase(doc.getVerificationStatus())) {
            throw new IllegalStateException("Approved documents cannot be directly overwritten. Please consult your advisor.");
        }

        // Delete previous physical file if existing
        if (doc.getFileUrl() != null && doc.getFileUrl().contains("/view-file/")) {
            String oldFile = doc.getFileUrl().substring(doc.getFileUrl().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(oldFile);
        }

        // Store new physical file
        String originalFilename = newFile.getOriginalFilename();
        String storedFileName = fileStorageService.storeFile(newFile, originalFilename);

        doc.setFileUrl("/api/customer/documents/view-file/" + storedFileName);
        doc.setFileSizeBytes(newFile.getSize());
        doc.setFileType(newFile.getContentType() != null ? newFile.getContentType() : "application/pdf");
        doc.setVerificationStatus("PENDING_REVIEW"); // Reset status on replacement

        auditService.logAction(
                "CLIENT",
                doc.getClient() != null ? doc.getClient().getId() : null,
                "DOCUMENT_REPLACE",
                "Digital KYC Vault",
                doc.getFileName(),
                "Replaced with " + originalFilename,
                user,
                null
        );

        return clientDocumentRepository.save(doc);
    }

    @Transactional
    public Map<String, Object> updateCustomerProfile(User user, Map<String, Object> payload) {
        String newFullName = (String) payload.get("fullName");
        String newEmail = (String) payload.get("email");
        String newCity = (String) payload.get("city");
        String newState = (String) payload.get("state");
        String newPincode = (String) payload.get("pincode");
        String newWhatsapp = (String) payload.get("whatsappNumber");

        if (newFullName != null && !newFullName.isBlank()) {
            user.setFullName(newFullName.trim());
        }
        if (newEmail != null && !newEmail.isBlank() && !newEmail.equalsIgnoreCase(user.getEmail())) {
            // Check if email taken by someone else
            Optional<User> existing = userRepository.findByEmail(newEmail.trim());
            if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Email is already registered by another account");
            }
            user.setEmail(newEmail.trim());
        }

        userRepository.save(user);

        // Bi-directional sync with Client 360 CRM record(s)
        List<Client> clients = clientRepository.findByCustomerUserIdOrderByUpdatedAtDesc(user.getId());
        if (clients.isEmpty() && user.getPhoneNumber() != null) {
            String clean = user.getPhoneNumber().replaceAll("[^0-9]", "");
            if (clean.length() >= 10) {
                clients = clientRepository.findByPhoneSuffix(clean.substring(clean.length() - 10));
            }
        }

        for (Client c : clients) {
            if (newFullName != null && !newFullName.isBlank()) c.setFullName(newFullName.trim());
            if (newEmail != null && !newEmail.isBlank()) c.setEmail(newEmail.trim());
            if (newCity != null) c.setCity(newCity.trim());
            if (newState != null) c.setState(newState.trim());
            if (newPincode != null) c.setPincode(newPincode.trim());
            if (newWhatsapp != null) c.setWhatsappNumber(newWhatsapp.trim());
            c.setCustomerUser(user);
            clientRepository.save(c);

            auditService.logAction(
                    "CLIENT",
                    c.getId(),
                    "CUSTOMER_PROFILE_UPDATE",
                    "Client 360 Demographics",
                    null,
                    "Customer updated profile details via Self-Service Portal (bi-directional sync)",
                    user,
                    null
            );
        }

        Map<String, Object> updatedProfile = new HashMap<>();
        updatedProfile.put("id", user.getId());
        updatedProfile.put("fullName", user.getFullName());
        updatedProfile.put("email", user.getEmail());
        updatedProfile.put("phoneNumber", user.getPhoneNumber());
        if (!clients.isEmpty()) {
            Client primary = clients.get(0);
            updatedProfile.put("city", primary.getCity() != null ? primary.getCity() : "");
            updatedProfile.put("state", primary.getState() != null ? primary.getState() : "");
            updatedProfile.put("pincode", primary.getPincode() != null ? primary.getPincode() : "");
            updatedProfile.put("whatsappNumber", primary.getWhatsappNumber() != null ? primary.getWhatsappNumber() : "");
        }

        return updatedProfile;
    }

    @Transactional
    public void changePassword(User user, Map<String, String> payload) {
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password entered");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditService.logAction(
                "USER",
                user.getId(),
                "PASSWORD_CHANGE",
                "Account Security",
                null,
                "Customer successfully changed portal login password",
                user,
                null
        );
    }

    public FileStorageService getFileStorageService() {
        return this.fileStorageService;
    }
}
