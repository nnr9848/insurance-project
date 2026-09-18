package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.FollowUpTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FollowUpTaskRepository extends JpaRepository<FollowUpTask, Long> {

    List<FollowUpTask> findByAdvisorIdAndStatusOrderByScheduledDatetimeAsc(Long advisorId, String status);

    List<FollowUpTask> findByClientIdOrderByScheduledDatetimeDesc(Long clientId);

    @Query("SELECT f FROM FollowUpTask f WHERE f.advisor.id = :advisorId AND f.scheduledDatetime BETWEEN :start AND :end AND f.status = 'PENDING' ORDER BY f.scheduledDatetime ASC")
    List<FollowUpTask> findDueTodayForAdvisor(@Param("advisorId") Long advisorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT f FROM FollowUpTask f WHERE f.advisor.id = :advisorId AND f.scheduledDatetime < :now AND f.status = 'PENDING' ORDER BY f.scheduledDatetime ASC")
    List<FollowUpTask> findOverdueForAdvisor(@Param("advisorId") Long advisorId, @Param("now") LocalDateTime now);

    @Query("SELECT f FROM FollowUpTask f WHERE f.advisor.manager.id = :managerId AND f.scheduledDatetime < :now AND f.status = 'PENDING' ORDER BY f.scheduledDatetime ASC")
    List<FollowUpTask> findOverdueForManager(@Param("managerId") Long managerId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(f) FROM FollowUpTask f WHERE f.advisor.id = :advisorId AND f.scheduledDatetime < :now AND f.status = 'PENDING'")
    long countOverdueForAdvisor(@Param("advisorId") Long advisorId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(f) FROM FollowUpTask f WHERE f.scheduledDatetime < :now AND f.status = 'PENDING'")
    long countAllOverdue(@Param("now") LocalDateTime now);
}
