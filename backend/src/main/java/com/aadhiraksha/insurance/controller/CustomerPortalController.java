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
