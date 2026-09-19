package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.ClientMeeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClientMeetingRepository extends JpaRepository<ClientMeeting, Long> {

    List<ClientMeeting> findByAdvisorIdOrderByMeetingDatetimeAsc(Long advisorId);

    List<ClientMeeting> findByClientIdOrderByMeetingDatetimeDesc(Long clientId);

    @Query("SELECT m FROM ClientMeeting m WHERE m.advisor.id = :advisorId AND m.meetingDatetime BETWEEN :start AND :end ORDER BY m.meetingDatetime ASC")
    List<ClientMeeting> findMeetingsForAdvisorBetween(@Param("advisorId") Long advisorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT m FROM ClientMeeting m WHERE m.advisor.manager.id = :managerId AND m.meetingDatetime BETWEEN :start AND :end ORDER BY m.meetingDatetime ASC")
    List<ClientMeeting> findMeetingsForManagerBetween(@Param("managerId") Long managerId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT m FROM ClientMeeting m WHERE m.meetingDatetime BETWEEN :start AND :end ORDER BY m.meetingDatetime ASC")
    List<ClientMeeting> findAllMeetingsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(m) FROM ClientMeeting m WHERE m.advisor.id = :advisorId AND m.meetingDatetime BETWEEN :start AND :end")
    long countMeetingsTodayForAdvisor(@Param("advisorId") Long advisorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(m) FROM ClientMeeting m WHERE m.meetingDatetime BETWEEN :start AND :end")
    long countAllMeetingsToday(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
