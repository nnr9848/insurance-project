package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.ClientOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientOpportunityRepository extends JpaRepository<ClientOpportunity, Long> {

    List<ClientOpportunity> findByClientIdOrderByIsPrimaryDescCreatedAtDesc(Long clientId);

    Optional<ClientOpportunity> findByInquiryId(Long inquiryId);

    @Query("SELECT o FROM ClientOpportunity o WHERE o.client.id = :clientId AND o.isPrimary = true")
    Optional<ClientOpportunity> findPrimaryOpportunityByClientId(@Param("clientId") Long clientId);

    @Query("SELECT o FROM ClientOpportunity o WHERE o.assignedAdvisor.id = :advisorId ORDER BY o.updatedAt DESC")
    List<ClientOpportunity> findByAssignedAdvisorId(@Param("advisorId") Long advisorId);
}
