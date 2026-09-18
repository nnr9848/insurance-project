package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.CrmUserDto;
import com.aadhiraksha.insurance.model.Role;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClientLeadRepository;
import com.aadhiraksha.insurance.repository.RoleRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrmUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClientLeadRepository clientLeadRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String NUMBER = "0123456789";
    private static final String SPECIAL = "@#$!";
    private static final String PASSWORD_ALLOW = CHAR_LOWER + CHAR_UPPER + NUMBER + SPECIAL;
    private static final SecureRandom random = new SecureRandom();

    public static String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        sb.append(CHAR_LOWER.charAt(random.nextInt(CHAR_LOWER.length())));
        sb.append(CHAR_UPPER.charAt(random.nextInt(CHAR_UPPER.length())));
        sb.append(NUMBER.charAt(random.nextInt(NUMBER.length())));
        sb.append(SPECIAL.charAt(random.nextInt(SPECIAL.length())));
        for (int i = 4; i < length; i++) {
            sb.append(PASSWORD_ALLOW.charAt(random.nextInt(PASSWORD_ALLOW.length())));
        }
        return sb.toString();
    }

    @Transactional
    public Map<String, Object> createUser(CrmUserDto.CreateUserRequest request, User performedBy) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists.");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : generateRandomPassword(10);

        String employeeCode = request.getEmployeeCode();
        if (employeeCode == null || employeeCode.trim().isEmpty()) {
            employeeCode = "EMP" + (1000 + random.nextInt(9000));
        }

        Role targetRole = roleRepository.findByName(request.getRole() != null ? request.getRole() : "ROLE_ADVISOR")
                .orElseGet(() -> roleRepository.save(Role.builder().name(request.getRole() != null ? request.getRole() : "ROLE_ADVISOR").build()));

        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager with ID " + request.getManagerId() + " not found."));
        }

        User user = User.builder()
                .employeeCode(employeeCode)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(rawPassword))
                .designation(request.getDesignation())
                .department(request.getDepartment() != null ? request.getDepartment() : "Insurance Sales")
                .manager(manager)
                .isActive(true)
                .mustChangePassword(true)
                .roles(new HashSet<>(Collections.singletonList(targetRole)))
                .build();

        User savedUser = userRepository.save(user);

        auditService.logAction("USER", savedUser.getId(), "CREATE", "ALL", null,
                "Created user " + savedUser.getFullName() + " with role " + targetRole.getName(), performedBy, null);

        Map<String, Object> result = new HashMap<>();
        result.put("user", mapToResponse(savedUser));
        result.put("temporaryPassword", rawPassword);
        return result;
    }

    @Transactional
    public CrmUserDto.UserResponse updateUser(Long userId, CrmUserDto.UpdateUserRequest request, User performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getDesignation() != null) user.setDesignation(request.getDesignation());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        if (request.getManagerId() != null) {
            User newManager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found with ID: " + request.getManagerId()));
            user.setManager(newManager);
        }

        User updated = userRepository.save(user);
        auditService.logAction("USER", updated.getId(), "UPDATE", "PROFILE", null,
                "Updated profile for " + updated.getFullName(), performedBy, null);

        return mapToResponse(updated);
    }

    @Transactional
    public Map<String, String> resetPassword(Long userId, String customPassword, User performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        String newRawPassword = (customPassword != null && !customPassword.trim().isEmpty())
                ? customPassword.trim()
                : generateRandomPassword(10);

        user.setPassword(passwordEncoder.encode(newRawPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        auditService.logAction("USER", user.getId(), "RESET_PASSWORD", "PASSWORD", null,
                "Password reset for " + user.getFullName(), performedBy, null);

        Map<String, String> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("temporaryPassword", newRawPassword);
        response.put("message", "Password reset successfully. User must change it on next login.");
        return response;
    }

    @Transactional(readOnly = true)
    public List<CrmUserDto.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CrmUserDto.UserResponse> getManagers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER") || r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_SUPER_ADMIN")))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CrmUserDto.UserResponse> getAdvisors() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADVISOR") || r.getName().equals("ROLE_STAFF")))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CrmUserDto.UserResponse> getTeamMembers(Long managerId) {
        return userRepository.findByManagerId(managerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CrmUserDto.UserResponse mapToResponse(User user) {
        long clientCount = clientLeadRepository.countByAssignedAdvisorId(user.getId());

        return CrmUserDto.UserResponse.builder()
                .id(user.getId())
                .employeeCode(user.getEmployeeCode())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .designation(user.getDesignation())
                .department(user.getDepartment())
                .managerId(user.getManager() != null ? user.getManager().getId() : null)
                .managerName(user.getManager() != null ? user.getManager().getFullName() : null)
                .isActive(user.getIsActive())
                .mustChangePassword(user.getMustChangePassword())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .assignedClientsCount(clientCount)
                .build();
    }
}
