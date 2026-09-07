package com.example.weeklyreport.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.weeklyreport.dto.UpdateRoleRequest;
import com.example.weeklyreport.dto.CreateUserRequest;
import com.example.weeklyreport.dto.UserProfileDto;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.security.SecurityUtils;
import com.example.weeklyreport.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile() {
        User currentUser = securityUtils.getCurrentUser();
        UserProfileDto profile = userService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<UserProfileDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<UserProfileDto> users = userService.getAllUsersWithStats(page, size);
        return ResponseEntity.ok(users);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<UserProfileDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.ok(userService.createUser(currentUser, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<UserProfileDto> getUserById(@PathVariable UUID id) {
        UserProfileDto profile = userService.getUserProfile(id);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileDto> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoleRequest request) {
        UserProfileDto profile = userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<UserProfileDto> toggleUserActive(@PathVariable UUID id) {
        UserProfileDto profile = userService.toggleUserActive(id);
        return ResponseEntity.ok(profile);
    }
}
