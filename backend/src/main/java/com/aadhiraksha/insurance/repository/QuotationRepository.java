package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    List<Quotation> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<Quotation> findByCreatedByAdvisorIdOrderByCreatedAtDesc(Long advisorId);

    List<Quotation> findAllByOrderByCreatedAtDesc();

    Optional<Quotation> findByQuoteNumber(String quoteNumber);

    @Query("SELECT q FROM Quotation q WHERE q.client.manager.id = :managerId ORDER BY q.createdAt DESC")
    List<Quotation> findByManagerId(@Param("managerId") Long managerId);

    long countByStatus(String status);
}
