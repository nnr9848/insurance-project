package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByClientCode(String clientCode);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT c FROM Client c WHERE REPLACE(REPLACE(REPLACE(c.phoneNumber, ' ', ''), '-', ''), '+91', '') LIKE %:phoneSuffix%")
    List<Client> findByPhoneSuffix(@Param("phoneSuffix") String phoneSuffix);

    List<Client> findByAssignedAdvisorIdOrderByUpdatedAtDesc(Long advisorId);

    List<Client> findByManagerIdOrderByUpdatedAtDesc(Long managerId);

    List<Client> findByStageOrderByUpdatedAtDesc(String stage);

    @Query("SELECT c FROM Client c WHERE c.assignedAdvisor.id = :advisorId AND c.stage = :stage ORDER BY c.updatedAt DESC")
    List<Client> findByAdvisorAndStage(@Param("advisorId") Long advisorId, @Param("stage") String stage);

    @Query("SELECT c FROM Client c WHERE c.manager.id = :managerId AND c.stage = :stage ORDER BY c.updatedAt DESC")
    List<Client> findByManagerAndStage(@Param("managerId") Long managerId, @Param("stage") String stage);

    @Query("SELECT c FROM Client c WHERE c.policyExpiryDate BETWEEN :startDate AND :endDate ORDER BY c.policyExpiryDate ASC")
    List<Client> findExpiringPolicies(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByStage(String stage);

    long countByAssignedAdvisorId(Long advisorId);

    long countByManagerId(Long managerId);
}
