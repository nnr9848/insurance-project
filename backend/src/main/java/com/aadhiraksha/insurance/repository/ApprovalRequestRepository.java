package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {

    List<ApprovalRequest> findAllByOrderByCreatedAtDesc();

    List<ApprovalRequest> findByStatusOrderByCreatedAtDesc(String status);

    List<ApprovalRequest> findByManagerIdOrderByCreatedAtDesc(Long managerId);

    List<ApprovalRequest> findByRequestedByIdOrderByCreatedAtDesc(Long requestedById);

    List<ApprovalRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);

    @Query("SELECT COUNT(a) FROM ApprovalRequest a WHERE a.status = 'PENDING' AND (a.manager.id = :managerId OR :managerId IS NULL)")
    long countPendingApprovals(@Param("managerId") Long managerId);
}
