package com.example.weeklyreport.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.weeklyreport.dto.LoginRequest;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.repository.UserRepository;
import com.example.weeklyreport.security.JwtUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceSecurityTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    @Test
    void inactiveUserCannotAuthenticate() {
        User inactiveUser = User.builder()
                .email("inactive@example.com")
                .password("encoded")
                .isActive(false)
                .build();
        when(userRepository.findByEmail(inactiveUser.getEmail())).thenReturn(Optional.of(inactiveUser));

        LoginRequest request = new LoginRequest();
        request.setEmail(inactiveUser.getEmail());
        request.setPassword("password");

        assertThrows(RuntimeException.class, () -> authService.authenticateUser(request));
        verify(authenticationManager, never()).authenticate(org.mockito.ArgumentMatchers.any());
    }
}
