package com.aadhiraksha.insurance.config;

import com.aadhiraksha.insurance.model.*;
import com.aadhiraksha.insurance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    @Bean
    public CommandLineRunner initDefaultAdmin(UserRepository userRepository,
                                              RoleRepository roleRepository,
                                              FollowUpTaskRepository followUpTaskRepository,
                                              PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure roles exist
            Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_SUPER_ADMIN").build()));

            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

            Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_MANAGER").build()));

            Role advisorRole = roleRepository.findByName("ROLE_ADVISOR")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADVISOR").build()));

            roleRepository.findByName("ROLE_STAFF")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STAFF").build()));

            Role pospRole = roleRepository.findByName("ROLE_POSP_AGENT")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_POSP_AGENT").build()));

            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

            // 1. Seed Super Admin
            String adminEmail = "admin@aadhiraksha.com";
            User admin = userRepository.findByEmail(adminEmail)
                    .or(() -> userRepository.findByPhoneNumber("+91 8367415156"))
                    .orElse(null);
            if (admin == null) {
                admin = User.builder()
                        .employeeCode("ADM001")
                        .fullName("Aadhiraksha Super Admin")
                        .email(adminEmail)
                        .phoneNumber("+91 8367415156")
                        .password(passwordEncoder.encode("Admin@12345"))
                        .designation("Managing Director & Chief Administrator")
                        .department("Executive Management")
                        .roles(new HashSet<>(Collections.singletonList(superAdminRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build();
                userRepository.save(admin);
                log.info("Initialized default Super Admin user: {} / Admin@12345", adminEmail);
            } else {
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin@12345"));
                admin.setRoles(new HashSet<>(Collections.singletonList(superAdminRole)));
                userRepository.save(admin);
            }

            // 2. Seed Insurance Manager
            String managerEmail = "manager@aadhiraksha.com";
            User manager = userRepository.findByEmail(managerEmail)
                    .or(() -> userRepository.findByPhoneNumber("+91 9848022338"))
                    .orElse(null);
            if (manager == null) {
                manager = User.builder()
                        .employeeCode("MGR101")
                        .fullName("Suresh Reddy")
                        .email(managerEmail)
                        .phoneNumber("+91 9848022338")
                        .password(passwordEncoder.encode("Manager@12345"))
                        .designation("Senior Branch Manager")
                        .department("Retail & Corporate Sales")
                        .roles(new HashSet<>(Collections.singletonList(managerRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build();
                manager = userRepository.save(manager);
                log.info("Initialized default Insurance Manager: {} / Manager@12345", managerEmail);
            } else {
                manager.setEmail(managerEmail);
                manager.setPassword(passwordEncoder.encode("Manager@12345"));
                manager.setRoles(new HashSet<>(Collections.singletonList(managerRole)));
                manager = userRepository.save(manager);
            }

            // 3. Seed Insurance Advisors under Manager
            String advisor1Email = "advisor@aadhiraksha.com";
            User advisor1 = userRepository.findByEmail(advisor1Email)
                    .or(() -> userRepository.findByPhoneNumber("+91 9988776655"))
                    .orElse(null);
            if (advisor1 == null) {
                advisor1 = User.builder()
                        .employeeCode("ADV201")
                        .fullName("Rajesh Kumar")
                        .email(advisor1Email)
                        .phoneNumber("+91 9988776655")
                        .password(passwordEncoder.encode("Advisor@12345"))
                        .designation("Insurance Advisor (Health & Motor)")
                        .department("Retail Sales")
                        .manager(manager)
                        .roles(new HashSet<>(Collections.singletonList(advisorRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build();
                userRepository.save(advisor1);
                log.info("Initialized default Insurance Advisor: {} / Advisor@12345", advisor1Email);
            } else {
                advisor1.setEmail(advisor1Email);
                advisor1.setPassword(passwordEncoder.encode("Advisor@12345"));
                advisor1.setManager(manager);
                advisor1.setRoles(new HashSet<>(Collections.singletonList(advisorRole)));
                userRepository.save(advisor1);
            }

            String advisor2Email = "priya.advisor@aadhiraksha.com";
            User advisor2 = userRepository.findByEmail(advisor2Email)
                    .or(() -> userRepository.findByPhoneNumber("+91 9876543210"))
                    .orElse(null);
            if (advisor2 == null) {
                advisor2 = User.builder()
                        .employeeCode("ADV202")
                        .fullName("Priya Sharma")
                        .email(advisor2Email)
                        .phoneNumber("+91 9876543210")
                        .password(passwordEncoder.encode("Advisor@12345"))
                        .designation("Senior Insurance Advisor (Life & SME)")
                        .department("Corporate Sales")
                        .manager(manager)
                        .roles(new HashSet<>(Collections.singletonList(advisorRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build();
                userRepository.save(advisor2);
                log.info("Initialized default Insurance Advisor 2: {} / Advisor@12345", advisor2Email);
            } else {
                advisor2.setEmail(advisor2Email);
                advisor2.setPassword(passwordEncoder.encode("Advisor@12345"));
                advisor2.setManager(manager);
                advisor2.setRoles(new HashSet<>(Collections.singletonList(advisorRole)));
                userRepository.save(advisor2);
            }

            // 4. Seed Certified POSP Agent
            String pospEmail = "posp@aadhiraksha.com";
            User pospAgent = userRepository.findByEmail(pospEmail)
                    .or(() -> userRepository.findByPhoneNumber("+91 9765432190"))
                    .orElse(null);
            if (pospAgent == null) {
                pospAgent = User.builder()
                        .employeeCode("POSP301")
                        .fullName("Vikram Patel")
                        .email(pospEmail)
                        .phoneNumber("+91 9765432190")
                        .password(passwordEncoder.encode("Posp@12345"))
                        .designation("Certified POSP Partner (IRDAI)")
                        .department("Partner Network")
                        .roles(new HashSet<>(Collections.singletonList(pospRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build();
                userRepository.save(pospAgent);
                log.info("Initialized default POSP Agent: {} / Posp@12345", pospEmail);
            } else {
                pospAgent.setEmail(pospEmail);
                pospAgent.setPassword(passwordEncoder.encode("Posp@12345"));
                pospAgent.setRoles(new HashSet<>(Collections.singletonList(pospRole)));
                userRepository.save(pospAgent);
            }

            // 5. Seed Customer / Policyholder User
            String customerEmail = "customer@aadhiraksha.com";
            User customer = userRepository.findByEmail(customerEmail)
                    .or(() -> userRepository.findByPhoneNumber("+91 9845012349"))
                    .orElse(null);
            if (customer == null) {
                customer = User.builder()
                        .employeeCode("CUST401")
                        .fullName("Kavita Rao")
                        .email(customerEmail)
                        .phoneNumber("+91 9845012349")
                        .password(passwordEncoder.encode("Customer@12345"))
                        .designation("Policyholder / Premium Client")
                        .department("Customer Portal")
                        .roles(new HashSet<>(Collections.singletonList(userRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build();
                userRepository.save(customer);
                log.info("Initialized default Customer: {} / Customer@12345", customerEmail);
            } else {
                customer.setEmail(customerEmail);
                customer.setPassword(passwordEncoder.encode("Customer@12345"));
                customer.setRoles(new HashSet<>(Collections.singletonList(userRole)));
                userRepository.save(customer);
            }

            // Ensure standard baseline staff & role accounts exist
            log.info("System accounts and roles baseline initialized successfully.");
        };
    }
}

