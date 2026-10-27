package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String trimmed = identifier != null ? identifier.trim() : "";
        User user = userRepository.findByEmail(trimmed)
                .or(() -> userRepository.findByPhoneNumber(trimmed))
                .or(() -> userRepository.findByEmployeeCode(trimmed.toUpperCase()))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));

        Set<org.springframework.security.core.GrantedAuthority> authorities = new java.util.HashSet<>();
        for (com.aadhiraksha.insurance.model.Role role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
            if (role.getPermissions() != null) {
                for (com.aadhiraksha.insurance.model.Permission perm : role.getPermissions()) {
                    authorities.add(new SimpleGrantedAuthority(perm.getCode()));
                }
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getIsActive(),
                true,
                true,
                true,
                authorities
        );
    }
}
