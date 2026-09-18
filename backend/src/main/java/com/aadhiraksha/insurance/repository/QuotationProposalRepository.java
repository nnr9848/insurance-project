package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.QuotationProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationProposalRepository extends JpaRepository<QuotationProposal, Long> {

    List<QuotationProposal> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<QuotationProposal> findByAdvisorIdOrderByCreatedAtDesc(Long advisorId);
}
