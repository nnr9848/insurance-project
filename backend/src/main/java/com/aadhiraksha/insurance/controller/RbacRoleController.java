package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.RbacDto;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.RbacRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm/roles")
@RequiredArgsConstructor
@Tag(name = "RBAC & Role Management", description = "Dynamic roles and granular permission matrix endpoints")
public class RbacRoleController {

    private final RbacRoleService rbacRoleService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping("/permissions/catalog")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'roles:manage')")
    @Operation(summary = "Get complete catalog of granular permissions grouped by module")
    public ResponseEntity<List<RbacDto.ModulePermissionsGroup>> getPermissionsCatalog() {
        return ResponseEntity.ok(rbacRoleService.getPermissionsCatalog());
    }

    @GetMapping("/manage")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'roles:manage')")
    @Operation(summary = "Get list of all system and custom dynamic roles with assigned permissions and user counts")
    public ResponseEntity<List<RbacDto.RoleDetailResponse>> getAllRoles() {
        return ResponseEntity.ok(rbacRoleService.getAllRoles());
    }

    @GetMapping("/manage/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'roles:manage')")
    @Operation(summary = "Get specific role details by ID")
    public ResponseEntity<RbacDto.RoleDetailResponse> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(rbacRoleService.getRoleById(id));
    }

    @PostMapping("/manage")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'roles:manage')")
    @Operation(summary = "Create a new custom dynamic role with custom permission bindings")
    public ResponseEntity<RbacDto.RoleDetailResponse> createCustomRole(
            @Valid @RequestBody RbacDto.CreateRoleRequest request,
            Authentication auth
    ) {
        User performedBy = getAuthenticatedUser(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(rbacRoleService.createCustomRole(request, performedBy));
    }

    @PutMapping("/manage/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'roles:manage')")
    @Operation(summary = "Update an existing role's display name, description, or permission set")
    public ResponseEntity<RbacDto.RoleDetailResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RbacDto.UpdateRoleRequest request,
            Authentication auth
    ) {
        User performedBy = getAuthenticatedUser(auth);
        return ResponseEntity.ok(rbacRoleService.updateRole(id, request, performedBy));
    }

    @DeleteMapping("/manage/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'roles:manage')")
    @Operation(summary = "Delete a custom dynamic role (system roles and roles with active assigned users are protected)")
    public ResponseEntity<Map<String, String>> deleteRole(@PathVariable Long id, Authentication auth) {
        User performedBy = getAuthenticatedUser(auth);
        rbacRoleService.deleteRole(id, performedBy);
        return ResponseEntity.ok(Map.of("message", "Role deleted successfully."));
    }
}
