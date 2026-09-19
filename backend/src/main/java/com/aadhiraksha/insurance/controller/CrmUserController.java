package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.CrmUserDto;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.CrmUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm/users")
@RequiredArgsConstructor
@Tag(name = "CRM User & Team Hierarchy", description = "Endpoints for managing Super Admin, Managers, Advisors, and Team Structures")
public class CrmUserController {

    private final CrmUserService crmUserService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName())
                .or(() -> userRepository.findByPhoneNumber(auth.getName()))
                .orElse(null);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Create a new user (Manager / Advisor) with temporary credentials (Super Admin only)")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody CrmUserDto.CreateUserRequest request, Authentication auth) {
        User performedBy = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmUserService.createUser(request, performedBy));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Get list of assignable system roles loaded from database filtered by caller permissions")
    public ResponseEntity<List<CrmUserDto.RoleOption>> getAssignableRoles(Authentication auth) {
        User performedBy = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmUserService.getAssignableRoles(performedBy));
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get list of active departments with their associated designations")
    public ResponseEntity<List<CrmUserDto.DepartmentOption>> getDepartments() {
        return ResponseEntity.ok(crmUserService.getDepartmentOptions());
    }

    @GetMapping("/designations")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get list of active designations, optionally filtered by departmentId")
    public ResponseEntity<List<CrmUserDto.DesignationOption>> getDesignations(@RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(crmUserService.getDesignationOptions(departmentId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Update user details, active status, or reassign manager (Super Admin only)")
    public ResponseEntity<CrmUserDto.UserResponse> updateUser(@PathVariable Long id, @RequestBody CrmUserDto.UpdateUserRequest request, Authentication auth) {
        User performedBy = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmUserService.updateUser(id, request, performedBy));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Reset password and generate new temporary credential (Super Admin only)")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id, @RequestBody(required = false) CrmUserDto.ResetPasswordRequest request, Authentication auth) {
        User performedBy = getAuthenticatedUser(auth);
        String customPassword = request != null ? request.getNewPassword() : null;
        return ResponseEntity.ok(crmUserService.resetPassword(id, customPassword, performedBy));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get staff directory (Super Admin gets all, Managers get only their assigned team)")
    public ResponseEntity<List<CrmUserDto.UserResponse>> getAllUsers(Authentication auth) {
        User performedBy = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmUserService.getAllUsers(performedBy));
    }

    @GetMapping("/managers")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "List all Insurance Managers")
    public ResponseEntity<List<CrmUserDto.UserResponse>> getManagers() {
        return ResponseEntity.ok(crmUserService.getManagers());
    }

    @GetMapping("/advisors")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "List all Insurance Advisors")
    public ResponseEntity<List<CrmUserDto.UserResponse>> getAdvisors() {
        return ResponseEntity.ok(crmUserService.getAdvisors());
    }

    @GetMapping("/team/{managerId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get team members assigned to a specific manager")
    public ResponseEntity<List<CrmUserDto.UserResponse>> getTeamMembers(@PathVariable Long managerId) {
        return ResponseEntity.ok(crmUserService.getTeamMembers(managerId));
    }
}
