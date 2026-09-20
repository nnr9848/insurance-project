package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.ClientLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientLeadRepository extends JpaRepository<ClientLead, Long> {

    Optional<ClientLead> findByClientCode(String clientCode);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT c FROM ClientLead c WHERE REPLACE(REPLACE(REPLACE(c.phoneNumber, ' ', ''), '-', ''), '+91', '') LIKE %:phoneSuffix%")
    List<ClientLead> findByPhoneSuffix(@Param("phoneSuffix") String phoneSuffix);

    List<ClientLead> findByAssignedAdvisorIdOrderByUpdatedAtDesc(Long advisorId);

    List<ClientLead> findByManagerIdOrderByUpdatedAtDesc(Long managerId);

    List<ClientLead> findByStageOrderByUpdatedAtDesc(String stage);

    @Query("SELECT c FROM ClientLead c WHERE c.assignedAdvisor.id = :advisorId AND c.stage = :stage ORDER BY c.updatedAt DESC")
    List<ClientLead> findByAdvisorAndStage(@Param("advisorId") Long advisorId, @Param("stage") String stage);

    @Query("SELECT c FROM ClientLead c WHERE c.manager.id = :managerId AND c.stage = :stage ORDER BY c.updatedAt DESC")
    List<ClientLead> findByManagerAndStage(@Param("managerId") Long managerId, @Param("stage") String stage);

    @Query("SELECT c FROM ClientLead c WHERE c.policyExpiryDate BETWEEN :startDate AND :endDate ORDER BY c.policyExpiryDate ASC")
    List<ClientLead> findExpiringPolicies(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByStage(String stage);

    long countByAssignedAdvisorId(Long advisorId);

    long countByManagerId(Long managerId);
}
