package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.AgentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentProfileRepository extends JpaRepository<AgentProfile, Long> {
    Optional<AgentProfile> findByUserId(Long userId);
    List<AgentProfile> findByStatusOrderByAppliedAtDesc(String status);
    List<AgentProfile> findAllByOrderByAppliedAtDesc();
}
