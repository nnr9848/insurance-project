package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.model.Client;
import com.aadhiraksha.insurance.model.PospCommission;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.PospService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@Slf4j
public class PospPortalController {

    private final PospService pospService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + auth.getName()));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_POSP_AGENT', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(pospService.getPospDashboard(user));
    }

    @GetMapping("/commissions")
    @PreAuthorize("hasAnyAuthority('ROLE_POSP_AGENT', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<PospCommission>> getCommissions(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(pospService.getAgentCommissions(user.getId()));
    }

    @GetMapping("/clients")
    @PreAuthorize("hasAnyAuthority('ROLE_POSP_AGENT', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<Client>> getAttributedClients(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(pospService.getAgentClients(user.getId()));
    }

    @PostMapping("/book")
    @PreAuthorize("hasAnyAuthority('ROLE_POSP_AGENT', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<PospCommission> bookPolicy(Authentication auth, @RequestBody Map<String, Object> payload) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(pospService.bookPolicy(user, payload));
    }
}
