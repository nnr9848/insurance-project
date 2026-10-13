package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.model.SalesContest;
import com.aadhiraksha.insurance.repository.SalesContestRepository;
import com.aadhiraksha.insurance.service.FileStorageService;
import com.aadhiraksha.insurance.service.TwilioWhatsAppService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sales Contests & Campaigns Hub", description = "Management and agent portal endpoints for monthly trip sprints, commissions, and marketing kits")
public class SalesContestController {

    private final SalesContestRepository contestRepository;
    private final FileStorageService fileStorageService;
    private final TwilioWhatsAppService twilioWhatsAppService;

    /**
     * Agent & Public Portal: Retrieve all active and currently running contests
     */
    @GetMapping("/active")
    @Operation(summary = "Get currently active sales contests & trip sprints")
    public ResponseEntity<List<SalesContest>> getActiveContests() {
        LocalDate today = LocalDate.now();
        List<SalesContest> active = contestRepository.findCurrentlyRunningContests(today);
        // Fallback to all active if no date-bounded contests match
        if (active.isEmpty()) {
            active = contestRepository.findByIsActiveTrueOrderByStartDateDesc();
        }
        return ResponseEntity.ok(active);
    }

    /**
     * Admin & Manager: List all contests (including upcoming and archived)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "List all contests for management desk")
    public ResponseEntity<List<SalesContest>> getAllContestsForAdmin() {
        return ResponseEntity.ok(contestRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Admin: Create a new contest or campaign sprint
     */
    @PostMapping("/admin")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new sales contest, trip incentive, or marketing collateral campaign")
    public ResponseEntity<SalesContest> createContest(@RequestBody SalesContest contest) {
        if (contest.getTitle() == null || contest.getTitle().isBlank()) {
            throw new IllegalArgumentException("Contest title is required");
        }
        if (contest.getStartDate() == null || contest.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and End date are required");
        }
        if (contest.getEndDate().isBefore(contest.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be prior to start date");
        }
        SalesContest saved = contestRepository.save(contest);
        log.info("Created new sales contest: id={}, title={}", saved.getId(), saved.getTitle());
        return ResponseEntity.ok(saved);
    }

    /**
     * Admin: Update an existing contest
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Update sales contest dates, terms, or status")
    public ResponseEntity<SalesContest> updateContest(
            @PathVariable Long id,
            @RequestBody SalesContest updateReq) {
        
        SalesContest existing = contestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contest not found with id: " + id));

        existing.setTitle(updateReq.getTitle());
        existing.setDescription(updateReq.getDescription());
        existing.setContestType(updateReq.getContestType());
        existing.setSponsorInsurer(updateReq.getSponsorInsurer());
        existing.setStartDate(updateReq.getStartDate());
        existing.setEndDate(updateReq.getEndDate());
        existing.setTargetMetricType(updateReq.getTargetMetricType());
        existing.setTargetValue(updateReq.getTargetValue());
        existing.setRewardDescription(updateReq.getRewardDescription());
        existing.setIsActive(updateReq.getIsActive());

        if (updateReq.getBannerImageUrl() != null) {
            existing.setBannerImageUrl(updateReq.getBannerImageUrl());
        }
        if (updateReq.getBrochureDocUrl() != null) {
            existing.setBrochureDocUrl(updateReq.getBrochureDocUrl());
        }

        SalesContest saved = contestRepository.save(existing);
        log.info("Updated sales contest: id={}, title={}", saved.getId(), saved.getTitle());
        return ResponseEntity.ok(saved);
    }

    /**
     * Admin: Upload poster banner image or brochure PDF for a contest
     */
    @PostMapping(value = "/admin/upload-asset", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Upload contest banner image or PDF circular")
    public ResponseEntity<Map<String, Object>> uploadContestAsset(
            @RequestParam("file") MultipartFile file) {
        
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File cannot be empty"));
        }

        String storedFileName = fileStorageService.storeFile(file, file.getOriginalFilename());
        String fileUrl = "/api/crm/documents/view-file/" + storedFileName;

        log.info("Uploaded contest asset: filename={}, url={}", storedFileName, fileUrl);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "fileName", storedFileName,
                "url", fileUrl
        ));
    }

    /**
     * Admin: Delete / Archive a contest
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Delete contest record")
    public ResponseEntity<Map<String, Object>> deleteContest(@PathVariable Long id) {
        if (!contestRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Contest not found"));
        }
        contestRepository.deleteById(id);
        log.info("Deleted sales contest id={}", id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Contest deleted successfully"));
    }
}
