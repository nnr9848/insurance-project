package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<Department> findByCode(String code);
    Optional<Department> findByNameIgnoreCase(String name);
}
