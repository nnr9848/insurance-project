package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.CustomerReviewRequest;
import com.aadhiraksha.insurance.dto.CustomerReviewStatsResponse;
import com.aadhiraksha.insurance.model.CustomerReview;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.service.CustomerReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Customer Reviews & Grievance Routing", description = "Public ratings, social proof testimonials, and smart negative review interception")
public class CustomerReviewController {

    private final CustomerReviewService reviewService;

    /**
     * Public submission of a customer review.
     * Smart Sentiment Routing automatically routes 4-5 stars to PUBLISHED (website social proof)
     * and 1-3 stars to INTERNAL_ESCALATION (CRM urgent callback, shielding Google Reviews).
     */
    @PostMapping("/reviews")
    @Operation(summary = "Submit a customer rating and review", description = "Public endpoint with smart sentiment interception")
    public ResponseEntity<Map<String, Object>> submitReview(@Valid @RequestBody CustomerReviewRequest request) {
        CustomerReview saved = reviewService.submitReview(request);

        boolean isPositive = saved.getRating() >= 4;
        String message = isPositive
                ? "Thank you for your valuable feedback! Your review is now published."
                : "Thank you for sharing your experience. We take your feedback very seriously. Our Senior Customer Resolution Specialist will contact you shortly to address your concerns.";

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "id", saved.getId(),
                "status", saved.getStatus(),
                "isPositive", isPositive,
                "message", message
        ));
    }

    /**
     * Public endpoint: retrieve published customer reviews for the website carousel & testimonials
     */
    @GetMapping("/reviews/published")
    @Operation(summary = "Get published customer reviews", description = "Public endpoint for website Wall of Love")
    public ResponseEntity<List<CustomerReview>> getPublishedReviews() {
        return ResponseEntity.ok(reviewService.getPublishedReviews());
    }

    /**
     * Public endpoint: retrieve aggregate rating statistics (average rating, count, breakdown)
     */
    @GetMapping("/reviews/stats")
    @Operation(summary = "Get aggregate review stats", description = "Public stats endpoint for trust badges and aggregate ratings")
    public ResponseEntity<CustomerReviewStatsResponse> getReviewStats() {
        return ResponseEntity.ok(reviewService.getReviewStats());
    }

    /**
     * Admin/CRM endpoint: retrieve all reviews including intercepted grievances
     */
    @GetMapping("/admin/reviews")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')")
    @Operation(summary = "Get all reviews for CRM moderation", description = "Admin endpoint showing published reviews and active escalations")
    public ResponseEntity<List<CustomerReview>> getAllReviewsAdmin() {
        return ResponseEntity.ok(reviewService.getAllReviewsAdmin());
    }

    /**
     * Admin/CRM endpoint: update review status, log resolution notes, or post an official admin response
     */
    @PutMapping("/admin/reviews/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Moderate review and resolve escalations", description = "Approve, reject, or mark grievances as resolved")
    public ResponseEntity<CustomerReview> updateReview(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User staffUser
    ) {
        String status = payload.get("status");
        String resolutionNotes = payload.get("resolutionNotes");
        String adminResponse = payload.get("adminResponse");

        CustomerReview updated = reviewService.updateReviewStatus(id, status, resolutionNotes, adminResponse, staffUser);
        return ResponseEntity.ok(updated);
    }
}
