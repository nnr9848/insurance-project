package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.QuoteDto;
import com.aadhiraksha.insurance.model.*;
import com.aadhiraksha.insurance.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Insurance & Portals", description = "Public & Portal APIs for Quotes, Hospitals, Claims, and POSP")
public class PortalController {

    private final InsuranceCategoryRepository categoryRepository;
    private final QuoteInquiryRepository quoteInquiryRepository;
    private final NetworkHospitalRepository hospitalRepository;
    private final AgentProfileRepository agentProfileRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.aadhiraksha.insurance.service.AuditService auditService;

    // Categories
    @GetMapping("/categories")
    @Operation(summary = "List all active insurance categories")
    public ResponseEntity<List<InsuranceCategory>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrue());
    }

    // Quotes / Inquiries
    @PostMapping("/quotes")
    @Operation(summary = "Submit a quote inquiry for any insurance/loan category")
    public ResponseEntity<QuoteInquiry> submitQuote(@Valid @RequestBody QuoteDto.InquiryRequest request) {
        QuoteInquiry inquiry = QuoteInquiry.builder()
                .categorySlug(request.getCategorySlug())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .city(request.getCity())
                .planDetails(request.getPlanDetails())
                .status("NEW")
                .build();
        return ResponseEntity.ok(quoteInquiryRepository.save(inquiry));
    }

    // Hospitals
    @GetMapping("/hospitals")
    @Operation(summary = "Search network hospitals by city and specialty query")
    public ResponseEntity<List<NetworkHospital>> searchHospitals(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(hospitalRepository.searchHospitals(
                (city != null && !city.isBlank()) ? city : null,
                (query != null && !query.isBlank()) ? query : null
        ));
    }

    @GetMapping("/hospitals/cities")
    @Operation(summary = "Get list of distinct hospital cities")
    public ResponseEntity<List<String>> getHospitalCities() {
        return ResponseEntity.ok(hospitalRepository.findDistinctCities());
    }

    // POSP Registration
    @PostMapping("/posp/apply")
    @Operation(summary = "Submit a POSP Agent application")
    public ResponseEntity<?> applyPOSP(@Valid @RequestBody QuoteDto.POSPApplicationRequest request) {
        User user;
        if (userRepository.existsByEmail(request.getEmail())) {
            user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        } else {
            Role agentRole = roleRepository.findByName("ROLE_POSP_AGENT")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_POSP_AGENT").build()));

            String rawPass = (request.getPassword() != null && !request.getPassword().isBlank()) 
                    ? request.getPassword() 
                    : "Posp@" + (request.getPhoneNumber().length() >= 4 ? request.getPhoneNumber().substring(request.getPhoneNumber().length() - 4) : "1234");

            user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .password(passwordEncoder.encode(rawPass))
                    .roles(new HashSet<>(Collections.singletonList(agentRole)))
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
        }

        AgentProfile profile = AgentProfile.builder()
                .user(user)
                .panNumber(request.getPanNumber())
                .aadhaarNumber(request.getAadhaarNumber())
                .city(request.getCity())
                .state(request.getState())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .status("PENDING")
                .build();

        return ResponseEntity.ok(agentProfileRepository.save(profile));
    }

    // Claims Submission
    @PostMapping("/claims/submit")
    @Operation(summary = "Submit an insurance claim")
    public ResponseEntity<Claim> submitClaim(@Valid @RequestBody QuoteDto.ClaimRequest request) {
        LocalDate incDate = null;
        if (request.getIncidentDate() != null && !request.getIncidentDate().isBlank()) {
            try {
                incDate = LocalDate.parse(request.getIncidentDate());
            } catch (Exception ignored) {}
        }

        Claim claim = Claim.builder()
                .policyNumber(request.getPolicyNumber())
                .claimantName(request.getClaimantName())
                .contactPhone(request.getContactPhone())
                .claimType(request.getClaimType())
                .hospitalOrGarage(request.getHospitalOrGarage())
                .incidentDate(incDate)
                .description(request.getDescription())
                .status("SUBMITTED")
                .build();
        return ResponseEntity.ok(claimRepository.save(claim));
    }

    // Admin APIs
    @GetMapping("/admin/quotes")
    @Operation(summary = "Get all customer quote inquiries (Admin/Staff only)")
    public ResponseEntity<List<QuoteInquiry>> getAllQuotes() {
        return ResponseEntity.ok(quoteInquiryRepository.findAllByOrderByCreatedAtDesc());
    }

    @PatchMapping("/admin/quotes/{id}/status")
    @Operation(summary = "Update Quote Inquiry status (NEW, CONTACTED, CONVERTED)")
    public ResponseEntity<QuoteInquiry> updateQuoteStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        QuoteInquiry inquiry = quoteInquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quote inquiry not found with ID: " + id));
        String newStatus = body.get("status");
        if (newStatus != null && !newStatus.isBlank()) {
            inquiry.setStatus(newStatus.toUpperCase());
        }
        return ResponseEntity.ok(quoteInquiryRepository.save(inquiry));
    }

    @GetMapping("/admin/posp-applications")
    @Operation(summary = "Get all POSP agent applications (Admin/Staff only)")
    public ResponseEntity<List<AgentProfile>> getAllPOSP() {
        return ResponseEntity.ok(agentProfileRepository.findAllByOrderByAppliedAtDesc());
    }

    @PatchMapping("/admin/posp-applications/{id}/status")
    @Operation(summary = "Update POSP application status (APPROVED / REJECTED)")
    public ResponseEntity<AgentProfile> updatePOSPStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        AgentProfile profile = agentProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));
        
        String newStatus = body.get("status");
        if (newStatus != null) {
            profile.setStatus(newStatus.toUpperCase());
            if ("APPROVED".equalsIgnoreCase(newStatus)) {
                profile.setApprovedAt(java.time.LocalDateTime.now());
            }
        }
        return ResponseEntity.ok(agentProfileRepository.save(profile));
    }

    @GetMapping("/admin/claims")
    @Operation(summary = "Get all submitted insurance claims (Admin/Staff only)")
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/admin/hospitals")
    @Operation(summary = "Get all network hospitals including inactive ones (Admin/Staff only)")
    public ResponseEntity<List<NetworkHospital>> getAllHospitalsForAdmin(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(hospitalRepository.searchAllHospitalsForAdmin(city, query));
    }

    // Admin Hospital Management APIs
    @PostMapping("/admin/hospitals")
    @Operation(summary = "Add a new network hospital (Admin/Staff only)")
    public ResponseEntity<NetworkHospital> createHospital(@Valid @RequestBody NetworkHospital hospital, org.springframework.security.core.Authentication auth) {
        hospital.setIsActive(true);
        NetworkHospital saved = hospitalRepository.save(hospital);
        User user = (auth != null && auth.getName() != null) ? userRepository.findByEmail(auth.getName()).orElse(null) : null;
        auditService.logAction("NETWORK_HOSPITAL", saved.getId(), "CREATE", "ALL", null, "Created cashless hospital: " + saved.getHospitalName(), user, null);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/admin/hospitals/bulk")
    @Operation(summary = "Bulk import network hospitals list (Admin/Staff only)")
    public ResponseEntity<List<NetworkHospital>> createHospitalsBulk(@RequestBody List<NetworkHospital> hospitals, org.springframework.security.core.Authentication auth) {
        for (NetworkHospital h : hospitals) {
            h.setIsActive(true);
        }
        List<NetworkHospital> saved = hospitalRepository.saveAll(hospitals);
        User user = (auth != null && auth.getName() != null) ? userRepository.findByEmail(auth.getName()).orElse(null) : null;
        auditService.logAction("NETWORK_HOSPITAL", 0L, "CREATE", "BULK_IMPORT", null, "Bulk imported " + saved.size() + " hospitals", user, null);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/admin/hospitals/{id}/toggle-status")
    @Operation(summary = "Soft-deactivate or restore a network hospital (Zero Hard Deletes)")
    public ResponseEntity<NetworkHospital> toggleHospitalStatus(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        NetworkHospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found with ID: " + id));

        boolean oldStatus = Boolean.TRUE.equals(hospital.getIsActive());
        boolean newStatus = !oldStatus;
        hospital.setIsActive(newStatus);
        NetworkHospital updated = hospitalRepository.save(hospital);

        User user = (auth != null && auth.getName() != null) ? userRepository.findByEmail(auth.getName()).orElse(null) : null;
        auditService.logAction("NETWORK_HOSPITAL", updated.getId(), newStatus ? "RESTORE" : "SOFT_DELETE", "IS_ACTIVE",
                String.valueOf(oldStatus), String.valueOf(newStatus), user, null);

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/hospitals/{id}")
    @Operation(summary = "Soft delete a network hospital (Backward compatibility)")
    public ResponseEntity<?> deleteHospital(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        return toggleHospitalStatus(id, auth);
    }
}
