package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByEntityNameAndEntityIdOrderByTimestampDesc(String entityName, Long entityId);

    List<AuditLog> findByEntityNameAndEntityIdInOrderByTimestampDesc(String entityName, Collection<Long> entityIds);

    List<AuditLog> findTop100ByOrderByTimestampDesc();
}
