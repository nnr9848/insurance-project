package com.aadhiraksha.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;

public class RbacDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PermissionItem {
        private Long id;
        private String code;
        private String module;
        private String label;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModulePermissionsGroup {
        private String module;
        private String moduleName;
        private List<PermissionItem> permissions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleDetailResponse {
        private Long id;
        private String name;
        private String displayName;
        private String description;
        private Boolean isSystem;
        private long assignedUsersCount;
        private Set<String> permissionCodes;
        private List<PermissionItem> permissions;
        private ZonedDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRoleRequest {
        @NotBlank(message = "Role internal key name is required")
        @Pattern(regexp = "^[A-Z0-9_]+$", message = "Role key must contain only uppercase letters, numbers and underscores")
        private String name;

        @NotBlank(message = "Role display name is required")
        private String displayName;

        private String description;

        @NotEmpty(message = "At least one permission must be assigned to the role")
        private Set<String> permissionCodes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRoleRequest {
        @NotBlank(message = "Role display name is required")
        private String displayName;

        private String description;

        @NotEmpty(message = "At least one permission must be assigned to the role")
        private Set<String> permissionCodes;
    }
}
