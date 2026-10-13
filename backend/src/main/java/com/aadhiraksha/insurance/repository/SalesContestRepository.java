package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.SalesContest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesContestRepository extends JpaRepository<SalesContest, Long> {

    List<SalesContest> findByIsActiveTrueOrderByStartDateDesc();

    @Query("SELECT c FROM SalesContest c WHERE c.isActive = true AND :today BETWEEN c.startDate AND c.endDate ORDER BY c.endDate ASC")
    List<SalesContest> findCurrentlyRunningContests(@Param("today") LocalDate today);

    List<SalesContest> findAllByOrderByCreatedAtDesc();
}
