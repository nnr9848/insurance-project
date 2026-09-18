package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.ClientDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientDocumentRepository extends JpaRepository<ClientDocument, Long> {

    List<ClientDocument> findByClientIdOrderByCreatedAtDesc(Long clientId);
}
