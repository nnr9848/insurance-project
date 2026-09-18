package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, Long> {

    List<CallLog> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<CallLog> findByAdvisorIdOrderByCreatedAtDesc(Long advisorId);

    @Query("SELECT c FROM CallLog c WHERE c.advisor.manager.id = :managerId ORDER BY c.createdAt DESC")
    List<CallLog> findByManagerIdOrderByCreatedAtDesc(@Param("managerId") Long managerId);

    @Query("SELECT COUNT(c) FROM CallLog c WHERE c.advisor.id = :advisorId AND c.createdAt >= :startOfDay")
    long countCallsTodayForAdvisor(@Param("advisorId") Long advisorId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COUNT(c) FROM CallLog c WHERE c.createdAt >= :startOfDay")
    long countAllCallsToday(@Param("startOfDay") LocalDateTime startOfDay);
}
