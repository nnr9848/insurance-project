package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.ClientDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientDocumentRepository extends JpaRepository<ClientDocument, Long> {

    List<ClientDocument> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<ClientDocument> findAllByOrderByCreatedAtDesc();

    List<ClientDocument> findByVerificationStatusOrderByCreatedAtDesc(String verificationStatus);

    @Query("SELECT d FROM ClientDocument d WHERE d.client.manager.id = :managerId ORDER BY d.createdAt DESC")
    List<ClientDocument> findByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT d FROM ClientDocument d WHERE d.client.assignedAdvisor.id = :advisorId ORDER BY d.createdAt DESC")
    List<ClientDocument> findByAdvisorId(@Param("advisorId") Long advisorId);
}
