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
