package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.config.JwtUtils;
import com.aadhiraksha.insurance.dto.AuthDto;
import com.aadhiraksha.insurance.model.Role;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.RoleRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already registered: " + request.getPhoneNumber());
        }

        String targetRoleName = "ROLE_USER";
        if (request.getRole() != null && !request.getRole().isBlank()) {
            targetRoleName = request.getRole().toUpperCase().startsWith("ROLE_") 
                    ? request.getRole().toUpperCase() 
                    : "ROLE_" + request.getRole().toUpperCase();
        }

        Role role = roleRepository.findByName(targetRoleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .roles(new HashSet<>(Collections.singletonList(role)))
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        return new AuthDto.AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), roleNames);
    }

    @Transactional
    public AuthDto.AuthResponse firebaseLogin(AuthDto.FirebaseLoginRequest request) {
        String phoneNumber = null;
        String name = request.getFullName();

        try {
            // Verify with Firebase Admin if initialized
            if (!com.google.firebase.FirebaseApp.getApps().isEmpty()) {
                com.google.firebase.auth.FirebaseToken decodedToken = 
                        com.google.firebase.auth.FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
                phoneNumber = (String) decodedToken.getClaims().get("phone_number");
                if (name == null || name.isBlank()) {
                    name = decodedToken.getName();
                }
            } else {
                // In local/mock mode without active Firebase keys, accept token payload safely for dev/testing
                phoneNumber = request.getIdToken().startsWith("+") ? request.getIdToken() : "+919876543210";
            }
        } catch (Exception ex) {
            throw new BadCredentialsException("Failed to verify Firebase authentication token: " + ex.getMessage());
        }

        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new BadCredentialsException("No phone number associated with this Firebase authentication token");
        }

        // Clean phone number (keep last 10 digits or normalized standard)
        String cleanPhone = phoneNumber.replaceAll("[^0-9]", "");
        if (cleanPhone.length() > 10) {
            cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
        }

        final String finalPhone = cleanPhone;
        final String finalName = (name != null && !name.isBlank()) ? name : "User " + finalPhone.substring(Math.max(0, finalPhone.length() - 4));

        User user = userRepository.findByPhoneNumber(finalPhone).orElseGet(() -> {
            String roleName = (request.getRole() != null && !request.getRole().isBlank()) 
                    ? request.getRole() 
                    : "ROLE_USER";
            if (!roleName.startsWith("ROLE_")) {
                roleName = "ROLE_" + roleName;
            }

            final String targetRole = roleName;
            Role role = roleRepository.findByName(targetRole)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(targetRole).build()));

            String syntheticEmail = "phone_" + finalPhone + "@aadhiraksha.internal";
            // Ensure unique email
            if (userRepository.existsByEmail(syntheticEmail)) {
                syntheticEmail = "phone_" + finalPhone + "_" + System.currentTimeMillis() + "@aadhiraksha.internal";
            }

            User newUser = User.builder()
                    .fullName(finalName)
                    .email(syntheticEmail)
                    .phoneNumber(finalPhone)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .isActive(true)
                    .roles(new HashSet<>(Collections.singletonList(role)))
                    .build();

            return userRepository.save(newUser);
        });

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        return new AuthDto.AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), roleNames);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhoneNumber(request.getIdentifier()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email/phone or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email/phone or password");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        return new AuthDto.AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), roleNames);
    }

    @Transactional(readOnly = true)
    public AuthDto.AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);
        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        return new AuthDto.AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), roleNames);
    }
}
