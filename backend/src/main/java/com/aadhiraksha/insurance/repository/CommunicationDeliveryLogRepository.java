package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.CommunicationDeliveryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CommunicationDeliveryLogRepository extends JpaRepository<CommunicationDeliveryLog, Long> {

    Page<CommunicationDeliveryLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<CommunicationDeliveryLog> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<CommunicationDeliveryLog> findByRecipientContainingIgnoreCaseOrderByCreatedAtDesc(String recipient, Pageable pageable);

    @Modifying
    @Query("DELETE FROM CommunicationDeliveryLog c WHERE c.createdAt < :cutoff")
    int deleteLogsOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
