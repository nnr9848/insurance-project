package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.CustomerReviewRequest;
import com.aadhiraksha.insurance.dto.CustomerReviewStatsResponse;
import com.aadhiraksha.insurance.model.CustomerReview;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.CustomerReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerReviewService {

    private final CustomerReviewRepository reviewRepository;

    /**
     * Submit a customer review with Smart Sentiment Routing.
     * Ratings 4-5 are published for public social proof.
     * Ratings 1-3 are routed internally to 'INTERNAL_ESCALATION' to intercept negative reviews before Google.
     */
    @Transactional
    public CustomerReview submitReview(CustomerReviewRequest request) {
        log.info("Received customer review from {} with rating {}", request.getCustomerName(), request.getRating());

        boolean isPositive = request.getRating() != null && request.getRating() >= 4;
        String initialStatus = isPositive ? "PUBLISHED" : "INTERNAL_ESCALATION";

        CustomerReview review = CustomerReview.builder()
                .customerName(request.getCustomerName().trim())
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null)
                .customerPhone(request.getCustomerPhone().trim())
                .policyType(request.getPolicyType() != null ? request.getPolicyType() : "Health Insurance")
                .rating(request.getRating())
                .reviewTitle(request.getReviewTitle() != null ? request.getReviewTitle().trim() : null)
                .reviewText(request.getReviewText().trim())
                .city(request.getCity() != null ? request.getCity().trim() : "Hyderabad")
                .status(initialStatus)
                .isVerifiedBuyer(true)
                .isFeatured(request.getRating() == 5)
                .build();

        CustomerReview saved = reviewRepository.save(review);
        if (!isPositive) {
            log.warn("CRITICAL GRIEVANCE INTERCEPTED: Review ID {} by {} routed to INTERNAL_ESCALATION (Rating: {})",
                    saved.getId(), saved.getCustomerName(), saved.getRating());
        }
        return saved;
    }

    @Transactional(readOnly = true)
    public List<CustomerReview> getPublishedReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
    }

    @Transactional(readOnly = true)
    public Page<CustomerReview> getPublishedReviewsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", pageable);
    }

    @Transactional(readOnly = true)
    public List<CustomerReview> getFeaturedReviews() {
        return reviewRepository.findByStatusAndIsFeaturedTrueOrderByCreatedAtDesc("PUBLISHED");
    }

    @Transactional(readOnly = true)
    public CustomerReviewStatsResponse getReviewStats() {
        Double avg = reviewRepository.getAveragePublishedRating();
        Long total = reviewRepository.countPublishedReviews();
        Long escalations = reviewRepository.countActiveEscalations();

        List<CustomerReview> all = reviewRepository.findAll();
        long fiveStar = all.stream().filter(r -> "PUBLISHED".equals(r.getStatus()) && r.getRating() == 5).count();
        long fourStar = all.stream().filter(r -> "PUBLISHED".equals(r.getStatus()) && r.getRating() == 4).count();

        return CustomerReviewStatsResponse.builder()
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 4.9)
                .totalReviews(total != null ? total : 0L)
                .fiveStarCount(fiveStar)
                .fourStarCount(fourStar)
                .activeEscalations(escalations != null ? escalations : 0L)
                .build();
    }

    // Admin Operations
    @Transactional(readOnly = true)
    public List<CustomerReview> getAllReviewsAdmin() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public CustomerReview updateReviewStatus(Long id, String status, String resolutionNotes, String adminResponse, User staffUser) {
        CustomerReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + id));

        if (status != null && !status.isBlank()) {
            review.setStatus(status.toUpperCase().trim());
        }
        if (resolutionNotes != null) {
            review.setResolutionNotes(resolutionNotes);
            review.setResolvedByStaff(staffUser);
        }
        if (adminResponse != null) {
            review.setAdminResponse(adminResponse);
            review.setRespondedAt(LocalDateTime.now());
        }
        return reviewRepository.save(review);
    }
}
