package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.model.Client;
import com.aadhiraksha.insurance.model.ClientDocument;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.CustomerPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@Slf4j
public class CustomerPortalController {

    private final CustomerPortalService customerPortalService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized: Please sign in");
        }
        return userRepository.findByEmail(auth.getName())
                .or(() -> userRepository.findByPhoneNumber(auth.getName()))
                .orElseThrow(() -> new RuntimeException("User account not found: " + auth.getName()));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(customerPortalService.getCustomerDashboard(user));
    }

    @GetMapping("/policies")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Client>> getMyPolicies(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(customerPortalService.getMyPolicies(user));
    }

    @GetMapping("/documents")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClientDocument>> getMyDocuments(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(customerPortalService.getMyDocuments(user));
    }

    @PostMapping("/documents/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClientDocument> uploadMyDocument(Authentication auth, @RequestBody Map<String, Object> payload) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(customerPortalService.uploadMyDocument(user, payload));
    }

    @PostMapping(value = "/documents/upload-file", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClientDocument> uploadMyDocumentFile(
            Authentication auth,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "fileName", required = false) String fileName
    ) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(customerPortalService.uploadMyDocumentMultipart(user, file, documentType, fileName));
    }

    @GetMapping("/documents/view-file/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> viewMyDocumentFile(@PathVariable String fileName) {
        try {
            java.nio.file.Path filePath = customerPortalService.getFileStorageService().loadFileAsPath(fileName);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = null;
            try {
                contentType = java.nio.file.Files.probeContentType(filePath);
            } catch (Exception ignored) {}
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception ex) {
            log.error("Failed to stream document file: {}", fileName, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/documents/{docId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> deleteMyDocument(Authentication auth, @PathVariable Long docId) {
        User user = getAuthenticatedUser(auth);
        customerPortalService.deleteMyDocument(user, docId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Document deleted successfully"));
    }

    @PutMapping("/documents/{docId}/rename")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClientDocument> renameMyDocument(
            Authentication auth,
            @PathVariable Long docId,
            @RequestBody Map<String, String> payload
    ) {
        User user = getAuthenticatedUser(auth);
        String title = payload.get("fileName");
        String category = payload.get("documentType");
        return ResponseEntity.ok(customerPortalService.renameMyDocument(user, docId, title, category));
    }

    @PostMapping(value = "/documents/{docId}/replace", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClientDocument> replaceMyDocument(
            Authentication auth,
            @PathVariable Long docId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(customerPortalService.replaceMyDocument(user, docId, file));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateMyProfile(Authentication auth, @RequestBody Map<String, Object> payload) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(customerPortalService.updateCustomerProfile(user, payload));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> changeMyPassword(Authentication auth, @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser(auth);
        customerPortalService.changePassword(user, payload);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
