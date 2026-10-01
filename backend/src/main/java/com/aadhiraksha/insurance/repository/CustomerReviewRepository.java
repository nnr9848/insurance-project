package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.CustomerReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {

    List<CustomerReview> findByStatusOrderByCreatedAtDesc(String status);

    Page<CustomerReview> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    List<CustomerReview> findByStatusAndIsFeaturedTrueOrderByCreatedAtDesc(String status);

    List<CustomerReview> findAllByOrderByCreatedAtDesc();

    @Query("SELECT AVG(r.rating) FROM CustomerReview r WHERE r.status = 'PUBLISHED'")
    Double getAveragePublishedRating();

    @Query("SELECT COUNT(r) FROM CustomerReview r WHERE r.status = 'PUBLISHED'")
    Long countPublishedReviews();

    @Query("SELECT COUNT(r) FROM CustomerReview r WHERE r.status = 'INTERNAL_ESCALATION'")
    Long countActiveEscalations();
}
