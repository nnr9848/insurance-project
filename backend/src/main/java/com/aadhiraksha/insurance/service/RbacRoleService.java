package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.RbacDto;
import com.aadhiraksha.insurance.model.Permission;
import com.aadhiraksha.insurance.model.Role;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.PermissionRepository;
import com.aadhiraksha.insurance.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RbacRoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditService auditService;

    private static final Map<String, String> MODULE_TITLES = Map.ofEntries(
            Map.entry("LEADS", "Leads & Customer Inquiries"),
            Map.entry("CLIENTS", "Clients & 360 CRM Portfolios"),
            Map.entry("QUOTES", "Quotations & Proposals"),
            Map.entry("RENEWALS", "Policy Renewals & Porting"),
            Map.entry("APPROVALS", "Manager Approvals & Workflows"),
            Map.entry("USERS", "Staff, Agents & Role Governance"),
            Map.entry("DOCUMENTS", "Document Locker & Storage"),
            Map.entry("CLAIMS", "Claims & TPA Intimations"),
            Map.entry("CMS", "Website CMS, Blogs & Reviews"),
            Map.entry("SETTINGS", "Integrations & API Settings"),
            Map.entry("AUDIT", "Audit Trail & Compliance")
    );

    @Transactional(readOnly = true)
    public List<RbacDto.ModulePermissionsGroup> getPermissionsCatalog() {
        List<Permission> allPermissions = permissionRepository.findAllByOrderByModuleAscLabelAsc();
        
        Map<String, List<RbacDto.PermissionItem>> grouped = allPermissions.stream()
                .map(this::mapPermission)
                .collect(Collectors.groupingBy(RbacDto.PermissionItem::getModule, LinkedHashMap::new, Collectors.toList()));

        List<RbacDto.ModulePermissionsGroup> result = new ArrayList<>();
        grouped.forEach((module, permissions) -> {
            result.add(RbacDto.ModulePermissionsGroup.builder()
                    .module(module)
                    .moduleName(MODULE_TITLES.getOrDefault(module, module))
                    .permissions(permissions)
                    .build());
        });

        return result;
    }

    @Transactional(readOnly = true)
    public List<RbacDto.RoleDetailResponse> getAllRoles() {
        List<Role> roles = roleRepository.findAllWithPermissions();
        return roles.stream()
                .map(r -> {
                    long userCount = roleRepository.countAssignedUsersByRoleId(r.getId());
                    return mapRole(r, userCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RbacDto.RoleDetailResponse getRoleById(Long id) {
        Role role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with ID: " + id));
        long userCount = roleRepository.countAssignedUsersByRoleId(role.getId());
        return mapRole(role, userCount);
    }

    @Transactional
    public RbacDto.RoleDetailResponse createCustomRole(RbacDto.CreateRoleRequest request, User performedBy) {
        String rawName = request.getName().trim().toUpperCase();
        String formattedKey = rawName.startsWith("ROLE_") ? rawName : "ROLE_" + rawName;

        if (roleRepository.findByName(formattedKey).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A role with key '" + formattedKey + "' already exists.");
        }

        Set<Permission> assignedPermissions = resolvePermissions(request.getPermissionCodes());

        Role newRole = Role.builder()
                .name(formattedKey)
                .displayName(request.getDisplayName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : "")
                .isSystem(false)
                .permissions(assignedPermissions)
                .build();

        Role saved = roleRepository.save(newRole);

        auditService.logAction(
                "ROLE",
                saved.getId(),
                "CREATE_ROLE",
                "permissions",
                null,
                saved.getName() + " (" + assignedPermissions.size() + " permissions)",
                performedBy,
                "INTERNAL_API"
        );

        return mapRole(saved, 0L);
    }

    @Transactional
    public RbacDto.RoleDetailResponse updateRole(Long id, RbacDto.UpdateRoleRequest request, User performedBy) {
        Role role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with ID: " + id));

        // Prevent modification of built-in system role permissions or key names
        if (Boolean.TRUE.equals(role.getIsSystem()) && "ROLE_SUPER_ADMIN".equals(role.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super Admin role is a foundational system archetype and cannot be modified.");
        }

        role.setDisplayName(request.getDisplayName().trim());
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription().trim());
        }

        // System roles preserve their base permissions, but custom roles can be fully adjusted
        if (!Boolean.TRUE.equals(role.getIsSystem())) {
            Set<Permission> assignedPermissions = resolvePermissions(request.getPermissionCodes());
            role.setPermissions(assignedPermissions);
        }

        Role updated = roleRepository.save(role);
        long userCount = roleRepository.countAssignedUsersByRoleId(updated.getId());

        auditService.logAction(
                "ROLE",
                updated.getId(),
                "UPDATE_ROLE",
                "details",
                null,
                updated.getDisplayName() + " (" + updated.getName() + ")",
                performedBy,
                "INTERNAL_API"
        );

        return mapRole(updated, userCount);
    }

    @Transactional
    public void deleteRole(Long id, User performedBy) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with ID: " + id));

        // Strict guard 1: Never delete default system roles
        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Built-in system roles are permanent and cannot be deleted.");
        }

        // Strict guard 2: Never delete a role if active users are assigned
        long userCount = roleRepository.countAssignedUsersByRoleId(id);
        if (userCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete role '" + role.getDisplayName() + "' because " + userCount + " user(s) are currently assigned to it. Please reassign them first.");
        }

        auditService.logAction(
                "ROLE",
                id,
                "DELETE_ROLE",
                "role",
                role.getName(),
                "DELETED",
                performedBy,
                "INTERNAL_API"
        );

        roleRepository.delete(role);
    }

    private Set<Permission> resolvePermissions(Set<String> permissionCodes) {
        if (permissionCodes == null || permissionCodes.isEmpty()) {
            return new HashSet<>();
        }
        Set<Permission> resolved = new HashSet<>();
        for (String code : permissionCodes) {
            permissionRepository.findByCode(code).ifPresent(resolved::add);
        }
        return resolved;
    }

    private RbacDto.RoleDetailResponse mapRole(Role r, long assignedCount) {
        Set<String> permCodes = r.getPermissions() != null
                ? r.getPermissions().stream().map(Permission::getCode).collect(Collectors.toSet())
                : Collections.emptySet();

        List<RbacDto.PermissionItem> permItems = r.getPermissions() != null
                ? r.getPermissions().stream().map(this::mapPermission).collect(Collectors.toList())
                : Collections.emptyList();

        return RbacDto.RoleDetailResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .displayName(r.getDisplayName() != null ? r.getDisplayName() : r.getName())
                .description(r.getDescription())
                .isSystem(Boolean.TRUE.equals(r.getIsSystem()))
                .assignedUsersCount(assignedCount)
                .permissionCodes(permCodes)
                .permissions(permItems)
                .createdAt(r.getCreatedAt())
                .build();
    }

    private RbacDto.PermissionItem mapPermission(Permission p) {
        return RbacDto.PermissionItem.builder()
                .id(p.getId())
                .code(p.getCode())
                .module(p.getModule())
                .label(p.getLabel())
                .description(p.getDescription())
                .build();
    }
}
