package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByCode(String code);
    List<Permission> findByModuleOrderByLabelAsc(String module);
    List<Permission> findAllByOrderByModuleAscLabelAsc();
}
