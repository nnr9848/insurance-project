package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.InsuranceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceCategoryRepository extends JpaRepository<InsuranceCategory, Long> {
    Optional<InsuranceCategory> findBySlug(String slug);
    List<InsuranceCategory> findByIsActiveTrue();
}
