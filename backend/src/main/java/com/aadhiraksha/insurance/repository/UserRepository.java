package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    Optional<User> findByEmployeeCode(String employeeCode);
    Boolean existsByEmail(String email);
    Boolean existsByPhoneNumber(String phoneNumber);
    Boolean existsByEmployeeCode(String employeeCode);

    List<User> findByManagerId(Long managerId);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName ORDER BY u.fullName ASC")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.manager.id = :managerId AND u.isActive = true ORDER BY u.fullName ASC")
    List<User> findActiveTeamByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE (r.name = 'ROLE_SUPER_ADMIN' OR r.name = 'ROLE_ADMIN') AND u.isActive = true AND u.id <> :excludeUserId")
    long countActiveSuperAdminsExcept(@Param("excludeUserId") Long excludeUserId);
}
