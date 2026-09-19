package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.CrmUserDto;
import com.aadhiraksha.insurance.model.Department;
import com.aadhiraksha.insurance.model.Designation;
import com.aadhiraksha.insurance.model.Role;
import com.aadhiraksha.insurance.model.StaffProfile;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClientLeadRepository;
import com.aadhiraksha.insurance.repository.DepartmentRepository;
import com.aadhiraksha.insurance.repository.DesignationRepository;
import com.aadhiraksha.insurance.repository.RoleRepository;
import com.aadhiraksha.insurance.repository.StaffProfileRepository;
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
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final StaffProfileRepository staffProfileRepository;
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

    private String generateEmployeeCode(String roleName) {
        String prefix = "ADV-";
        if ("ROLE_SUPER_ADMIN".equals(roleName)) prefix = "ADM-";
        else if ("ROLE_ADMIN".equals(roleName)) prefix = "ADM-";
        else if ("ROLE_MANAGER".equals(roleName)) prefix = "MGR-";
        else if ("ROLE_POSP_AGENT".equals(roleName)) prefix = "POSP-";
        else if ("ROLE_STAFF".equals(roleName)) prefix = "STF-";

        String code;
        do {
            int randomNum = 100000 + random.nextInt(900000);
            code = prefix + randomNum;
        } while (userRepository.existsByEmployeeCode(code));

        return code;
    }

    @Transactional
    public Map<String, Object> createUser(CrmUserDto.CreateUserRequest request, User performedBy) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists.");
        }

        String targetRoleName = request.getRole() != null ? request.getRole() : "ROLE_ADVISOR";

        // RBAC Boundary: Only Super Admins / Admins can create staff/users on the platform
        if (performedBy != null) {
            boolean isCallerSuperAdmin = performedBy.getRoles().stream()
                    .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

            if (!isCallerSuperAdmin) {
                throw new IllegalArgumentException("Access Denied: Only Super Administrators have permission to create and provision new platform users.");
            }
        }

        Role targetRole = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> new IllegalArgumentException("Role " + targetRoleName + " not found."));

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : generateRandomPassword(10);

        String employeeCode = request.getEmployeeCode();
        if (employeeCode == null || employeeCode.trim().isEmpty()) {
            employeeCode = generateEmployeeCode(targetRoleName);
        } else {
            if (userRepository.existsByEmployeeCode(employeeCode.trim())) {
                throw new IllegalArgumentException("Employee Code " + employeeCode + " is already taken.");
            }
            employeeCode = employeeCode.trim().toUpperCase();
        }

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
                .department(request.getDepartment() != null ? request.getDepartment() : "Retail Sales (Health, Life & Motor)")
                .manager(manager)
                .isActive(true)
                .mustChangePassword(true)
                .roles(new HashSet<>(Collections.singletonList(targetRole)))
                .build();

        User savedUser = userRepository.save(user);

        // Resolve relational Department and Designation entities for StaffProfile
        Department department = null;
        if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
            department = departmentRepository.findByNameIgnoreCase(request.getDepartment().trim()).orElse(null);
        }

        Designation designation = null;
        if (request.getDesignation() != null && !request.getDesignation().trim().isEmpty()) {
            designation = designationRepository.findByNameIgnoreCase(request.getDesignation().trim()).orElse(null);
        }

        // Persist dedicated StaffProfile extension
        StaffProfile staffProfile = StaffProfile.builder()
                .user(savedUser)
                .employeeCode(employeeCode)
                .reportingManager(manager)
                .department(department)
                .designation(designation)
                .departmentName(request.getDepartment() != null ? request.getDepartment() : (department != null ? department.getName() : "Retail Sales (Health, Life & Motor)"))
                .designationName(request.getDesignation() != null ? request.getDesignation() : (designation != null ? designation.getName() : "Insurance Advisor"))
                .mustChangePassword(true)
                .build();
        staffProfileRepository.save(staffProfile);

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

        boolean isSuperAdmin = performedBy != null && performedBy.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

        // IAM Governance: Only Super Admins have authority to modify employee profiles or credentials
        if (!isSuperAdmin) {
            throw new IllegalArgumentException("Access Denied: Only Super Administrators have permission to modify employee profiles or roles.");
        }

        // 1. Self-deactivation prevention guardrail
        if (Boolean.FALSE.equals(request.getIsActive()) && performedBy != null && user.getId().equals(performedBy.getId())) {
            throw new IllegalArgumentException("Security Protection: You cannot deactivate your own account.");
        }

        // 2. Last active Super Admin protection guardrail
        if (Boolean.FALSE.equals(request.getIsActive()) && user.getIsActive()) {
            boolean isTargetSuperAdmin = user.getRoles().stream()
                    .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

            if (isTargetSuperAdmin) {
                long remainingSuperAdmins = userRepository.countActiveSuperAdminsExcept(user.getId());
                if (remainingSuperAdmins == 0) {
                    throw new IllegalStateException("System Protection: Cannot deactivate the last remaining active Super Administrator.");
                }
            }
        }

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getDesignation() != null) user.setDesignation(request.getDesignation());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        // Only Super Admins can reassign a user's manager
        if (request.getManagerId() != null && isSuperAdmin) {
            User newManager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found with ID: " + request.getManagerId()));
            user.setManager(newManager);
        }

        User updated = userRepository.save(user);

        // Synchronize dedicated StaffProfile extension
        StaffProfile staffProfile = staffProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> StaffProfile.builder().user(user).employeeCode(user.getEmployeeCode()).build());

        if (request.getDesignation() != null) {
            staffProfile.setDesignationName(request.getDesignation());
            Designation desig = designationRepository.findByNameIgnoreCase(request.getDesignation().trim()).orElse(null);
            staffProfile.setDesignation(desig);
        }
        if (request.getDepartment() != null) {
            staffProfile.setDepartmentName(request.getDepartment());
            Department dept = departmentRepository.findByNameIgnoreCase(request.getDepartment().trim()).orElse(null);
            staffProfile.setDepartment(dept);
        }
        if (request.getManagerId() != null && isSuperAdmin) {
            staffProfile.setReportingManager(user.getManager());
        }
        staffProfileRepository.save(staffProfile);

        auditService.logAction("USER", updated.getId(), "UPDATE", "PROFILE", null,
                "Updated profile for " + updated.getFullName(), performedBy, null);

        return mapToResponse(updated);
    }

    @Transactional
    public Map<String, String> resetPassword(Long userId, String customPassword, User performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        boolean isSuperAdmin = performedBy != null && performedBy.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

        // IAM Governance: Only Super Admins have authority to reset credentials
        if (!isSuperAdmin) {
            throw new IllegalArgumentException("Access Denied: Only Super Administrators have permission to reset user credentials.");
        }

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
    public List<CrmUserDto.UserResponse> getAllUsers(User performedBy) {
        boolean isSuperAdmin = performedBy != null && performedBy.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

        if (isSuperAdmin) {
            return userRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // If caller is a Manager, strictly return only employees assigned under this manager
        if (performedBy != null && performedBy.getRoles().stream().anyMatch(r -> "ROLE_MANAGER".equals(r.getName()))) {
            return userRepository.findByManagerId(performedBy.getId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Fallback: empty list for unauthorized tiers
        return Collections.emptyList();
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

    @Transactional(readOnly = true)
    public List<CrmUserDto.RoleOption> getAssignableRoles(User caller) {
        List<Role> allRoles = roleRepository.findAll();
        boolean isCallerSuperAdmin = caller == null || caller.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

        List<CrmUserDto.RoleOption> roleOptions = new ArrayList<>();

        for (Role r : allRoles) {
            String roleName = r.getName();
            // Skip general customer role
            if ("ROLE_USER".equals(roleName)) continue;

            // If caller is Branch Manager, they can only create/manage Advisors and POSP Agents
            if (!isCallerSuperAdmin) {
                if ("ROLE_SUPER_ADMIN".equals(roleName) || "ROLE_ADMIN".equals(roleName) || "ROLE_MANAGER".equals(roleName)) {
                    continue;
                }
            }

            CrmUserDto.RoleOption option = CrmUserDto.RoleOption.builder()
                    .code(roleName)
                    .label(formatRoleLabel(roleName))
                    .description(getRoleDescription(roleName))
                    .category(getRoleCategory(roleName))
                    .build();

            roleOptions.add(option);
        }

        return roleOptions;
    }

    private String formatRoleLabel(String roleName) {
        switch (roleName) {
            case "ROLE_SUPER_ADMIN": return "Super Admin (Full Global Access)";
            case "ROLE_ADMIN": return "Administrator";
            case "ROLE_MANAGER": return "Branch Manager";
            case "ROLE_ADVISOR": return "Insurance Advisor / Employee";
            case "ROLE_POSP_AGENT": return "POSP Agent Partner";
            case "ROLE_STAFF": return "Operations / Support Staff";
            default: return roleName.replace("ROLE_", "");
        }
    }

    private String getRoleDescription(String roleName) {
        switch (roleName) {
            case "ROLE_SUPER_ADMIN": return "Full global oversight, team governance, credential resets, hospital network management";
            case "ROLE_ADMIN": return "Administrative operations and user management";
            case "ROLE_MANAGER": return "Oversees assigned branch advisors, monitors pipelines, reassigns leads";
            case "ROLE_ADVISOR": return "Manages assigned client portfolio, schedules calls, creates policies";
            case "ROLE_POSP_AGENT": return "External certified insurance agent partner";
            case "ROLE_STAFF": return "Operational back-office support";
            default: return "System Role";
        }
    }

    private String getRoleCategory(String roleName) {
        switch (roleName) {
            case "ROLE_SUPER_ADMIN":
            case "ROLE_ADMIN": return "MANAGEMENT";
            case "ROLE_MANAGER": return "SUPERVISORY";
            case "ROLE_ADVISOR":
            case "ROLE_STAFF": return "SALES_OPERATIONS";
            case "ROLE_POSP_AGENT": return "EXTERNAL_PARTNER";
            default: return "OTHER";
        }
    }

    public List<CrmUserDto.DepartmentOption> getDepartmentOptions() {
        List<Department> departments = departmentRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        List<Designation> designations = designationRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        Map<Long, List<CrmUserDto.DesignationOption>> designationMap = designations.stream()
                .filter(d -> d.getDepartment() != null)
                .map(d -> CrmUserDto.DesignationOption.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .departmentId(d.getDepartment().getId())
                        .departmentName(d.getDepartment().getName())
                        .displayOrder(d.getDisplayOrder())
                        .build())
                .collect(Collectors.groupingBy(CrmUserDto.DesignationOption::getDepartmentId));

        return departments.stream()
                .map(dept -> CrmUserDto.DepartmentOption.builder()
                        .id(dept.getId())
                        .name(dept.getName())
                        .code(dept.getCode())
                        .displayOrder(dept.getDisplayOrder())
                        .designations(designationMap.getOrDefault(dept.getId(), Collections.emptyList()))
                        .build())
                .collect(Collectors.toList());
    }

    public List<CrmUserDto.DesignationOption> getDesignationOptions(Long departmentId) {
        List<Designation> designations;
        if (departmentId != null) {
            designations = designationRepository.findByDepartmentIdAndIsActiveTrueOrderByDisplayOrderAsc(departmentId);
        } else {
            designations = designationRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        }

        return designations.stream()
                .map(d -> CrmUserDto.DesignationOption.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .departmentId(d.getDepartment() != null ? d.getDepartment().getId() : null)
                        .departmentName(d.getDepartment() != null ? d.getDepartment().getName() : null)
                        .displayOrder(d.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }

    public CrmUserDto.UserResponse mapToResponse(User user) {
        long clientCount = clientLeadRepository.countByAssignedAdvisorId(user.getId());

        StaffProfile staff = staffProfileRepository.findByUserId(user.getId()).orElse(null);

        String employeeCode = staff != null && staff.getEmployeeCode() != null ? staff.getEmployeeCode() : user.getEmployeeCode();
        String designation = staff != null && staff.getDesignationName() != null ? staff.getDesignationName() : user.getDesignation();
        String department = staff != null && staff.getDepartmentName() != null ? staff.getDepartmentName() : user.getDepartment();
        Long managerId = staff != null && staff.getReportingManager() != null ? staff.getReportingManager().getId() : (user.getManager() != null ? user.getManager().getId() : null);
        String managerName = staff != null && staff.getReportingManager() != null ? staff.getReportingManager().getFullName() : (user.getManager() != null ? user.getManager().getFullName() : null);

        return CrmUserDto.UserResponse.builder()
                .id(user.getId())
                .employeeCode(employeeCode)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .designation(designation)
                .department(department)
                .managerId(managerId)
                .managerName(managerName)
                .isActive(user.getIsActive())
                .mustChangePassword(user.getMustChangePassword())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .assignedClientsCount(clientCount)
                .build();
    }
}
