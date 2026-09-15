package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByPolicyNumberOrderByCreatedAtDesc(String policyNumber);
    List<Claim> findAllByOrderByCreatedAtDesc();
}
