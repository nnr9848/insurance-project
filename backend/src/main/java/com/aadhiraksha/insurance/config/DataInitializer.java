package com.aadhiraksha.insurance.config;

import com.aadhiraksha.insurance.model.Role;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.RoleRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    @Bean
    public CommandLineRunner initDefaultAdmin(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

            roleRepository.findByName("ROLE_STAFF")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STAFF").build()));

            roleRepository.findByName("ROLE_POSP_AGENT")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_POSP_AGENT").build()));

            roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

            String adminEmail = "admin@aadhiraksha.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .fullName("Aadhiraksha System Admin")
                        .email(adminEmail)
                        .phoneNumber("+91 8367415156")
                        .password(passwordEncoder.encode("Admin@12345"))
                        .roles(new HashSet<>(Collections.singletonList(adminRole)))
                        .isActive(true)
                        .build();
                userRepository.save(admin);
                log.info("Initialized default admin user: {} / Admin@12345", adminEmail);
            }
        };
    }
}
