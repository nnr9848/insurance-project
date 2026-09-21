package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.QuoteInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteInquiryRepository extends JpaRepository<QuoteInquiry, Long> {
    List<QuoteInquiry> findAllByOrderByCreatedAtDesc();
    List<QuoteInquiry> findByCategorySlugOrderByCreatedAtDesc(String categorySlug);

    @Query("SELECT q FROM QuoteInquiry q WHERE REPLACE(REPLACE(REPLACE(COALESCE(q.phoneNumber, ''), ' ', ''), '-', ''), '+91', '') LIKE %:phoneSuffix% OR REPLACE(REPLACE(REPLACE(COALESCE(q.secondaryPhone, ''), ' ', ''), '-', ''), '+91', '') LIKE %:phoneSuffix%")
    List<QuoteInquiry> findByPhoneSuffix(@Param("phoneSuffix") String phoneSuffix);
}
