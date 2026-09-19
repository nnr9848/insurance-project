package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {
    Optional<StaffProfile> findByUserId(Long userId);
    Optional<StaffProfile> findByEmployeeCode(String employeeCode);
    List<StaffProfile> findByReportingManagerId(Long managerId);
    List<StaffProfile> findByDepartmentId(Long departmentId);
}
