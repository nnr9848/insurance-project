package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.InsurancePartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsurancePartnerRepository extends JpaRepository<InsurancePartner, Long> {

    List<InsurancePartner> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<InsurancePartner> findAllByOrderByDisplayOrderAsc();
}
