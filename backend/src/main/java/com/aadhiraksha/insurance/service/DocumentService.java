package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.DocumentDto;
import com.aadhiraksha.insurance.model.Client;
import com.aadhiraksha.insurance.model.ClientDocument;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClientDocumentRepository;
import com.aadhiraksha.insurance.repository.ClientRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final ClientDocumentRepository clientDocumentRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public DocumentDto.Response uploadDocument(DocumentDto.UploadRequest request, String userEmail) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        ClientDocument doc = ClientDocument.builder()
                .client(client)
                .documentType(request.getDocumentType())
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .fileSizeBytes(request.getFileSizeBytes() != null ? request.getFileSizeBytes() : 0L)
                .fileType(request.getFileType() != null ? request.getFileType() : "application/pdf")
                .verificationStatus("PENDING_REVIEW")
                .uploadedBy(user)
                .build();

        ClientDocument saved = clientDocumentRepository.save(doc);

        // Advance client stage to DOCUMENTS if currently in NEW_LEAD / FOLLOWUP
        if ("NEW_LEAD".equals(client.getStage()) || "FOLLOWUP".equals(client.getStage()) || "QUOTATION".equals(client.getStage())) {
            client.setStage("DOCUMENTS");
            clientRepository.save(client);
        }

        // Audit Logging
        auditService.logAction(
                "Client",
                client.getId(),
                "UPLOAD",
                "Document Added",
                null,
                "Uploaded " + doc.getDocumentType() + " (" + doc.getFileName() + ")",
                user,
                null
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DocumentDto.Response> getDocuments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        boolean isSuperAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<ClientDocument> docs;
        if (isSuperAdmin) {
            docs = clientDocumentRepository.findAllByOrderByCreatedAtDesc();
        } else if (isManager) {
            docs = clientDocumentRepository.findByManagerId(user.getId());
        } else {
            docs = clientDocumentRepository.findByAdvisorId(user.getId());
        }

        return docs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentDto.Response> getClientDocuments(Long clientId) {
        return clientDocumentRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentDto.Response verifyDocument(Long docId, DocumentDto.VerifyRequest request, String userEmail) {
        ClientDocument doc = clientDocumentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + docId));

        User verifier = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        String oldStatus = doc.getVerificationStatus();
        doc.setVerificationStatus(request.getStatus());
        doc.setVerificationNotes(request.getNotes());
        doc.setVerifiedBy(verifier);
        doc.setVerifiedAt(LocalDateTime.now());

        ClientDocument updated = clientDocumentRepository.save(doc);

        // Audit Trail
        auditService.logAction(
                "Client",
                doc.getClient().getId(),
                "UPDATE",
                "Verification Status",
                oldStatus,
                request.getStatus() + (request.getNotes() != null ? " - " + request.getNotes() : ""),
                verifier,
                null
        );

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteDocument(Long docId, String userEmail) {
        ClientDocument doc = clientDocumentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + docId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        // Audit Trail
        auditService.logAction(
                "Client",
                doc.getClient().getId(),
                "DELETE",
                "Document Removed",
                doc.getFileName(),
                null,
                user,
                null
        );

        clientDocumentRepository.delete(doc);
    }

    @Transactional(readOnly = true)
    public DocumentDto.DocumentRequestLink generateWhatsAppDocumentRequest(Long clientId, List<String> requestedDocTypes, String userEmail) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        User advisor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Advisor not found"));

        String checklistText = (requestedDocTypes == null || requestedDocTypes.isEmpty())
                ? "• Aadhaar Card (Front & Back)\n• PAN Card\n• Previous Policy Copy / Renewal Notice\n• 2-Year Medical Discharge Summary (if applicable)"
                : requestedDocTypes.stream().map(d -> "• " + d.replace('_', ' ')).collect(Collectors.joining("\n"));

        String message = "📁 *Aadhiraksha InsurTech - Document Checklist for Insurance Issuance*\n\n" +
                "Dear " + client.getFullName() + ",\n" +
                "To finalize the proposal and issuance of your " + (client.getInsuranceType() != null ? client.getInsuranceType().replace('_', ' ') : "Insurance") + " policy, please share clear scanned copies or photos of the following documents:\n\n" +
                checklistText + "\n\n" +
                "You can reply directly to this WhatsApp chat with the document attachments, or email them to documents@aadhiraksha.com referencing Client ID #" + client.getClientCode() + ".\n\n" +
                "👤 *Dedicated Specialist:* " + advisor.getFullName() + "\n" +
                "📞 *Helpline:* " + (advisor.getPhoneNumber() != null ? advisor.getPhoneNumber() : "+91 98480 12345");

        String cleanPhone = QuotationService.formatWhatsAppNumber(client.getPhoneNumber());
        String waUrl = "https://wa.me/" + cleanPhone + "?text=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

        // Audit Trail
        auditService.logAction(
                "Client",
                client.getId(),
                "CALL_LOG",
                "Document Request Dispatched",
                null,
                "Sent WhatsApp Document Checklist to " + cleanPhone,
                advisor,
                null
        );

        return DocumentDto.DocumentRequestLink.builder()
                .clientName(client.getFullName())
                .clientPhone(cleanPhone)
                .whatsAppUrl(waUrl)
                .checklist(checklistText)
                .build();
    }

    private DocumentDto.Response mapToResponse(ClientDocument d) {
        return DocumentDto.Response.builder()
                .id(d.getId())
                .clientId(d.getClient() != null ? d.getClient().getId() : null)
                .clientName(d.getClient() != null ? d.getClient().getFullName() : "Unknown")
                .clientPhone(d.getClient() != null ? d.getClient().getPhoneNumber() : "")
                .documentType(d.getDocumentType())
                .fileName(d.getFileName())
                .fileUrl(d.getFileUrl())
                .fileSizeBytes(d.getFileSizeBytes())
                .fileType(d.getFileType())
                .verificationStatus(d.getVerificationStatus())
                .verifiedById(d.getVerifiedBy() != null ? d.getVerifiedBy().getId() : null)
                .verifiedByName(d.getVerifiedBy() != null ? d.getVerifiedBy().getFullName() : null)
                .verificationNotes(d.getVerificationNotes())
                .verifiedAt(d.getVerifiedAt())
                .uploadedById(d.getUploadedBy() != null ? d.getUploadedBy().getId() : null)
                .uploadedByName(d.getUploadedBy() != null ? d.getUploadedBy().getFullName() : "System")
                .createdAt(d.getCreatedAt())
                .build();
    }
}
