package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.CrmUserDto;
import com.aadhiraksha.insurance.model.Department;
import com.aadhiraksha.insurance.model.Designation;
import com.aadhiraksha.insurance.model.Role;
import com.aadhiraksha.insurance.model.StaffProfile;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClientRepository;
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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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
    private final com.aadhiraksha.insurance.repository.AgentProfileRepository agentProfileRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final MailboxProvisioningService mailboxProvisioningService;
    private final EmailService emailService;

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
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail().trim())) {
            throw new IllegalArgumentException("User with email " + request.getEmail().trim() + " already exists.");
        }

        // Canonical 10-digit phone number standardization
        String normalizedPhone = null;
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            String digitsOnly = request.getPhoneNumber().replaceAll("[^0-9]", "");
            normalizedPhone = digitsOnly.length() >= 10 ? digitsOnly.substring(digitsOnly.length() - 10) : digitsOnly;
            if (userRepository.existsByPhoneNumber(normalizedPhone) || userRepository.existsByPhoneNumber(request.getPhoneNumber().trim())) {
                throw new IllegalArgumentException("User with phone number " + normalizedPhone + " already exists in the system.");
            }
        }

        if (request.getEmployeeCode() != null && !request.getEmployeeCode().trim().isEmpty() && userRepository.existsByEmployeeCode(request.getEmployeeCode().trim())) {
            throw new IllegalArgumentException("Employee code " + request.getEmployeeCode().trim() + " is already in use.");
        }

        String targetRoleName = request.getRole() != null ? request.getRole() : "ROLE_ADVISOR";

        // RBAC Boundary: Tiered hierarchical user creation
        User manager = null;
        if (performedBy != null) {
            boolean isCallerSuperAdmin = performedBy.getRoles().stream()
                    .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));
            boolean isCallerManager = performedBy.getRoles().stream()
                    .anyMatch(r -> "ROLE_MANAGER".equals(r.getName()));
            boolean isCallerEmployee = performedBy.getRoles().stream()
                    .anyMatch(r -> "ROLE_ADVISOR".equals(r.getName()) || "ROLE_STAFF".equals(r.getName()));

            if (isCallerSuperAdmin) {
                // Super Admin can create any role and assign any manager
                if (request.getManagerId() != null) {
                    manager = userRepository.findById(request.getManagerId())
                            .orElseThrow(() -> new IllegalArgumentException("Manager with ID " + request.getManagerId() + " not found."));
                }
            } else if (isCallerManager) {
                // Managers can add POSP Agents or Advisors under their own branch
                if (!"ROLE_POSP_AGENT".equals(targetRoleName) && !"ROLE_ADVISOR".equals(targetRoleName)) {
                    throw new IllegalArgumentException("Access Denied: Managers can only onboard POSP Agents or Advisors.");
                }
                manager = performedBy;
            } else if (isCallerEmployee) {
                // Employees / Advisors can strictly onboard POSP Agents under their sponsorship
                if (!"ROLE_POSP_AGENT".equals(targetRoleName)) {
                    throw new IllegalArgumentException("Access Denied: Employees can only onboard external POSP Agent partners.");
                }
                manager = performedBy;
            } else {
                throw new IllegalArgumentException("Access Denied: Insufficient permissions to provision users.");
            }
        } else {
            // Unauthenticated context fallback (or system tests)
            if (request.getManagerId() != null) {
                manager = userRepository.findById(request.getManagerId())
                        .orElseThrow(() -> new IllegalArgumentException("Manager with ID " + request.getManagerId() + " not found."));
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

        User user = User.builder()
                .employeeCode(employeeCode)
                .fullName(request.getFullName())
                .email(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null)
                .phoneNumber(normalizedPhone != null ? normalizedPhone : request.getPhoneNumber())
                .password(passwordEncoder.encode(rawPassword))
                .designation(request.getDesignation() != null ? request.getDesignation() : ("ROLE_POSP_AGENT".equals(targetRoleName) ? "POSP Agent Partner" : "Insurance Advisor"))
                .department(request.getDepartment() != null ? request.getDepartment() : ("ROLE_POSP_AGENT".equals(targetRoleName) ? "POSP Partner Distribution" : "Retail Sales (Health, Life & Motor)"))
                .manager(manager)
                .isActive(true)
                .mustChangePassword(true)
                .roles(new HashSet<>(Collections.singletonList(targetRole)))
                .build();

        User savedUser = userRepository.save(user);

        // If target is POSP Agent, automatically create AgentProfile record
        if ("ROLE_POSP_AGENT".equals(targetRoleName)) {
            com.aadhiraksha.insurance.model.AgentProfile agentProfile = com.aadhiraksha.insurance.model.AgentProfile.builder()
                    .user(savedUser)
                    .panNumber("PENDING-" + savedUser.getId())
                    .city("Hyderabad")
                    .state("Telangana")
                    .status("APPROVED")
                    .experienceYears(1)
                    .trainingCompleted(true)
                    .examScorePercentage(85)
                    .defaultCommissionRate(new java.math.BigDecimal("15.00"))
                    .approvedAt(java.time.LocalDateTime.now())
                    .build();
            agentProfileRepository.save(agentProfile);
        }

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
                .departmentName(request.getDepartment() != null ? request.getDepartment() : (department != null ? department.getName() : ("ROLE_POSP_AGENT".equals(targetRoleName) ? "POSP Partner Distribution" : "Retail Sales (Health, Life & Motor)")))
                .designationName(request.getDesignation() != null ? request.getDesignation() : (designation != null ? designation.getName() : ("ROLE_POSP_AGENT".equals(targetRoleName) ? "POSP Agent Partner" : "Insurance Advisor")))
                .mustChangePassword(true)
                .build();
        staffProfileRepository.save(staffProfile);

        auditService.logAction("USER", savedUser.getId(), "CREATE", "ALL", null,
                "Created user " + savedUser.getFullName() + " with role " + targetRole.getName() + " by " + (performedBy != null ? performedBy.getFullName() : "SYSTEM"), performedBy, null);

        Map<String, Object> result = new HashMap<>();
        result.put("temporaryPassword", rawPassword);

        // Auto-provision domain mailbox if requested
        String provisionedMailboxPassword = null;
        if (Boolean.TRUE.equals(request.getCreateDomainMailbox())) {
            try {
                // Generate high-entropy 16-character password guaranteed to satisfy Stalwart zxcvbn password policy
                provisionedMailboxPassword = MailboxProvisioningService.generateStalwartCompliantPassword();
                // Pass savedUser entity directly into provisionEmployeeMailboxForUser to prevent
                // transaction boundary isolation visibility issues (e.g. "User not found with ID: X")
                Map<String, Object> mailboxRes = mailboxProvisioningService.provisionEmployeeMailboxForUser(
                        savedUser,
                        request.getCustomMailboxUsername(),
                        provisionedMailboxPassword,
                        false,
                        performedBy
                );
                result.put("domainMailbox", mailboxRes);
            } catch (Exception ex) {
                log.warn("Automatic domain mailbox provisioning failed during user creation: {}", ex.getMessage());
                result.put("domainMailboxError", ex.getMessage());
                provisionedMailboxPassword = null;
            }
        }

        // Final step: Asynchronously dispatch welcome credentials email ONLY AFTER transaction commits successfully
        final User finalCommittedUser = savedUser;
        final String finalRawPassword = rawPassword;
        final String finalMailboxPassword = provisionedMailboxPassword;
        if (finalCommittedUser.getEmail() != null && finalCommittedUser.getEmail().contains("@")) {
            if (TransactionSynchronizationManager.isActualTransactionActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        String domainEmail = finalCommittedUser.getDomainMailboxEmail();
                        emailService.sendWelcomeCredentialsEmail(
                                finalCommittedUser.getEmail(),
                                finalCommittedUser.getFullName(),
                                finalRawPassword,
                                domainEmail,
                                finalMailboxPassword
                        );
                    }
                });
            } else {
                // Fallback for non-transactional contexts (e.g. unit tests)
                String domainEmail = finalCommittedUser.getDomainMailboxEmail();
                emailService.sendWelcomeCredentialsEmail(
                        finalCommittedUser.getEmail(),
                        finalCommittedUser.getFullName(),
                        finalRawPassword,
                        domainEmail,
                        finalMailboxPassword
                );
            }
        }

        result.put("user", mapToResponse(savedUser));
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

        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            String newPhone = request.getPhoneNumber().trim();
            userRepository.findByPhoneNumber(newPhone).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new IllegalArgumentException("User with phone number " + newPhone + " already exists.");
                }
            });
            user.setPhoneNumber(newPhone);
        }
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

        // Final step: Asynchronously dispatch updated credentials ONLY AFTER transaction commits
        final User finalResetUser = user;
        final String finalResetPassword = newRawPassword;
        if (finalResetUser.getEmail() != null && finalResetUser.getEmail().contains("@")) {
            if (TransactionSynchronizationManager.isActualTransactionActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        emailService.sendWelcomeCredentialsEmail(
                                finalResetUser.getEmail(),
                                finalResetUser.getFullName(),
                                finalResetPassword,
                                finalResetUser.getDomainMailboxEmail()
                        );
                    }
                });
            } else {
                emailService.sendWelcomeCredentialsEmail(
                        finalResetUser.getEmail(),
                        finalResetUser.getFullName(),
                        finalResetPassword,
                        finalResetUser.getDomainMailboxEmail()
                );
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("temporaryPassword", newRawPassword);
        response.put("message", "Password reset successfully and dispatched to " + user.getEmail() + ". User must change it on next login.");
        return response;
    }

    /**
     * Resend Welcome & Credentials Email to an existing employee/POSP agent.
     * Generates a fresh temporary password and delivers it to their contact email.
     */
    @Transactional
    public Map<String, Object> resendWelcomeEmail(Long userId, User performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        boolean isSuperAdmin = performedBy != null && performedBy.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

        if (!isSuperAdmin) {
            throw new IllegalArgumentException("Access Denied: Only Super Administrators can dispatch onboarding credentials.");
        }

        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new IllegalArgumentException("User does not have a valid contact email address configured.");
        }

        String newRawPassword = generateRandomPassword(10);
        user.setPassword(passwordEncoder.encode(newRawPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        auditService.logAction("USER", user.getId(), "RESEND_WELCOME", "CREDENTIALS", null,
                "Welcome credentials re-dispatched to " + user.getEmail() + " for " + user.getFullName(), performedBy, null);

        // Final step: Asynchronously dispatch credentials ONLY AFTER transaction commits
        final User finalResendUser = user;
        final String finalResendPassword = newRawPassword;
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    emailService.sendWelcomeCredentialsEmail(
                            finalResendUser.getEmail(),
                            finalResendUser.getFullName(),
                            finalResendPassword,
                            finalResendUser.getDomainMailboxEmail()
                    );
                }
            });
        } else {
            emailService.sendWelcomeCredentialsEmail(
                    finalResendUser.getEmail(),
                    finalResendUser.getFullName(),
                    finalResendPassword,
                    finalResendUser.getDomainMailboxEmail()
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("email", user.getEmail());
        response.put("temporaryPassword", newRawPassword);
        response.put("message", "Welcome credentials re-dispatched to " + user.getEmail());
        return response;
    }

    /**
     * Permanently delete a test, mistyped, or inactive user account.
     * Enforces enterprise guardrails:
     * - Prevents deleting self
     * - Prevents deleting the last remaining Super Admin
     * - Blocks deletion if user has assigned clients
     * - Automatically cleans up staff profiles and deprovisions Stalwart mailboxes
     */
    @Transactional
    public Map<String, Object> deleteUser(Long userId, User performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        boolean isSuperAdmin = performedBy != null && performedBy.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));

        if (!isSuperAdmin) {
            throw new IllegalArgumentException("Access Denied: Only Super Administrators can delete user accounts.");
        }

        // Guardrail 1: Self-deletion prevention
        if (performedBy != null && performedBy.getId().equals(user.getId())) {
            throw new IllegalStateException("Security Protection: You cannot delete your own active administrator account.");
        }

        // Guardrail 2: Last Super Admin protection
        boolean targetIsAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName()));
        if (targetIsAdmin) {
            long totalActiveAdmins = userRepository.findAll().stream()
                    .filter(u -> Boolean.TRUE.equals(u.getIsActive()) && u.getRoles().stream().anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()) || "ROLE_ADMIN".equals(r.getName())))
                    .count();
            if (totalActiveAdmins <= 1) {
                throw new IllegalStateException("System Protection: Cannot delete the last remaining active Super Administrator.");
            }
        }

        // Guardrail 3: Block if user has assigned clients
        long assignedClients = clientRepository.countByAssignedAdvisorId(user.getId());
        if (assignedClients > 0) {
            throw new IllegalStateException(String.format(
                    "Cannot delete %s: User has %d assigned clients. Please reassign their clients to another advisor before deleting, or deactivate the account instead.",
                    user.getFullName(), assignedClients
            ));
        }

        // 1. Deprovision Stalwart mailbox if one was assigned
        if (Boolean.TRUE.equals(user.getHasDomainMailbox()) && user.getDomainMailboxEmail() != null) {
            try {
                mailboxProvisioningService.deprovisionMailbox(user.getId(), performedBy);
                log.info("Deprovisioned mailbox for user ID: {} before deletion", user.getId());
            } catch (Exception ex) {
                log.warn("Non-fatal: could not deprovision mailbox during user deletion: {}", ex.getMessage());
            }
        }

        // 2. Unlink any subordinate team members if target was a manager
        List<User> subordinates = userRepository.findByManagerId(user.getId());
        for (User sub : subordinates) {
            sub.setManager(null);
            userRepository.save(sub);
        }

        // 3. Remove StaffProfile and AgentProfile associations
        staffProfileRepository.findByUserId(user.getId()).ifPresent(staffProfileRepository::delete);
        agentProfileRepository.findByUserId(user.getId()).ifPresent(agentProfileRepository::delete);

        String deletedName = user.getFullName();
        String deletedEmail = user.getEmail();

        auditService.logAction("USER", user.getId(), "DELETE", "ACCOUNT", null,
                "Permanently deleted user: " + deletedName + " (" + deletedEmail + ")", performedBy, null);

        // 4. Hard delete user record
        userRepository.delete(user);

        log.info("User ID: {} ({}) permanently deleted by admin: {}", userId, deletedName, performedBy.getFullName());

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "User " + deletedName + " has been permanently deleted.");
        res.put("deletedUserId", userId);
        return res;
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
        boolean isCallerManager = caller != null && caller.getRoles().stream()
                .anyMatch(r -> "ROLE_MANAGER".equals(r.getName()));
        boolean isCallerAdvisor = caller != null && caller.getRoles().stream()
                .anyMatch(r -> "ROLE_ADVISOR".equals(r.getName()) || "ROLE_STAFF".equals(r.getName()));

        List<CrmUserDto.RoleOption> roleOptions = new ArrayList<>();

        for (Role r : allRoles) {
            String roleName = r.getName();
            // Skip general customer role
            if ("ROLE_USER".equals(roleName)) continue;

            // Tiered role filtering:
            if (!isCallerSuperAdmin) {
                if (isCallerManager) {
                    // Managers can onboard Advisors and POSP Agents
                    if (!"ROLE_ADVISOR".equals(roleName) && !"ROLE_POSP_AGENT".equals(roleName)) {
                        continue;
                    }
                } else if (isCallerAdvisor) {
                    // Employees/Advisors can strictly onboard POSP Agent partners
                    if (!"ROLE_POSP_AGENT".equals(roleName)) {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            CrmUserDto.RoleOption option = CrmUserDto.RoleOption.builder()
                    .code(roleName)
                    .label(formatRoleLabel(r))
                    .description(getRoleDescription(r))
                    .category(getRoleCategory(roleName))
                    .build();

            roleOptions.add(option);
        }

        return roleOptions;
    }

    private String formatRoleLabel(Role role) {
        if (role.getDisplayName() != null && !role.getDisplayName().isBlank()) {
            return role.getDisplayName();
        }
        String roleName = role.getName();
        switch (roleName) {
            case "ROLE_SUPER_ADMIN": return "Super Admin (Full Global Access)";
            case "ROLE_ADMIN": return "Administrator";
            case "ROLE_MANAGER": return "Branch Manager";
            case "ROLE_ADVISOR": return "Insurance Advisor / Employee";
            case "ROLE_POSP_AGENT": return "POSP Agent Partner";
            case "ROLE_STAFF": return "Operations / Support Staff";
            default: return roleName.replace("ROLE_", "").replace("_", " ");
        }
    }

    private String getRoleDescription(Role role) {
        if (role.getDescription() != null && !role.getDescription().isBlank()) {
            return role.getDescription();
        }
        String roleName = role.getName();
        switch (roleName) {
            case "ROLE_SUPER_ADMIN": return "Full global oversight, team governance, credential resets, hospital network management";
            case "ROLE_ADMIN": return "Administrative operations and user management";
            case "ROLE_MANAGER": return "Oversees assigned branch advisors, monitors pipelines, reassigns leads";
            case "ROLE_ADVISOR": return "Manages assigned client portfolio, schedules calls, creates policies";
            case "ROLE_POSP_AGENT": return "External certified insurance agent partner";
            case "ROLE_STAFF": return "Operational back-office support";
            default: return "Custom Role";
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
        long clientCount = clientRepository.countByAssignedAdvisorId(user.getId());

        StaffProfile staff = staffProfileRepository.findByUserId(user.getId()).orElse(null);

        String employeeCode = staff != null && staff.getEmployeeCode() != null ? staff.getEmployeeCode() : user.getEmployeeCode();
        String designation = staff != null && staff.getDesignationName() != null ? staff.getDesignationName() : user.getDesignation();
        String department = staff != null && staff.getDepartmentName() != null ? staff.getDepartmentName() : user.getDepartment();
        Long managerId = staff != null && staff.getReportingManager() != null ? staff.getReportingManager().getId() : (user.getManager() != null ? user.getManager().getId() : null);
        String managerName = staff != null && staff.getReportingManager() != null ? staff.getReportingManager().getFullName() : (user.getManager() != null ? user.getManager().getFullName() : null);

        boolean isCustomer = user.getRoles().stream().anyMatch(r -> "ROLE_USER".equals(r.getName()) || "ROLE_CUSTOMER".equals(r.getName()));
        
        String clientCode = null;
        long policyCount = 0;
        if (isCustomer) {
            String phone = user.getPhoneNumber();
            if (phone != null && !phone.isBlank()) {
                String cleanPhone = phone.replaceAll("[^0-9]", "");
                if (cleanPhone.length() >= 10) {
                    cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
                }
                List<com.aadhiraksha.insurance.model.Client> matching = clientRepository.findByPhoneSuffix(cleanPhone);
                if (!matching.isEmpty()) {
                    clientCode = matching.get(0).getClientCode();
                    policyCount = matching.size();
                }
            }
        }

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
                .lastLoginAt(user.getUpdatedAt())
                .assignedClientsCount(clientCount)
                .hasDomainMailbox(Boolean.TRUE.equals(user.getHasDomainMailbox()))
                .domainMailboxEmail(user.getDomainMailboxEmail())
                .mailboxStatus(user.getMailboxStatus())
                .mailboxCreatedAt(user.getMailboxCreatedAt())
                .clientCode(clientCode)
                .linkedPoliciesCount(policyCount)
                .isCustomerUser(isCustomer)
                .build();
    }
}
