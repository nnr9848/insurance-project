package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.QuoteInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteInquiryRepository extends JpaRepository<QuoteInquiry, Long> {
    List<QuoteInquiry> findAllByOrderByCreatedAtDesc();
    List<QuoteInquiry> findByCategorySlugOrderByCreatedAtDesc(String categorySlug);
}
