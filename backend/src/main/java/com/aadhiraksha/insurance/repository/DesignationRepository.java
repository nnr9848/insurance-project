package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {
    List<Designation> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Designation> findByDepartmentIdAndIsActiveTrueOrderByDisplayOrderAsc(Long departmentId);
    Optional<Designation> findByCode(String code);
    Optional<Designation> findByNameIgnoreCase(String name);
}
