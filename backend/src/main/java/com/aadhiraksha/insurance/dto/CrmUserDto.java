package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

public class CrmUserDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleOption {
        private String code;
        private String label;
        private String description;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        private String employeeCode;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String password; // Optional: if empty, auto-generate temp password
        private String designation;
        private String department;
        private Long managerId;
        private String role; // ROLE_MANAGER, ROLE_ADVISOR, ROLE_STAFF, ROLE_POSP_AGENT
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String fullName;
        private String phoneNumber;
        private String designation;
        private String department;
        private Long managerId;
        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        private String newPassword;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String employeeCode;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String designation;
        private String department;
        private Long managerId;
        private String managerName;
        private Boolean isActive;
        private Boolean mustChangePassword;
        private Set<String> roles;
        private LocalDateTime createdAt;
        private Long assignedClientsCount;
    }
}
