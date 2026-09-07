package com.example.weeklyreport.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.weeklyreport.dto.CreateUserRequest;
import com.example.weeklyreport.dto.UserProfileDto;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.repository.ReportRepository;
import com.example.weeklyreport.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDto createUser(User creator, CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already Existing!");
        }
        if (creator.getRole() == User.UserRole.MANAGER && request.getRole() == User.UserRole.ADMIN) {
            throw new RuntimeException("Managers cannot create admin users.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .managerId(creator.getRole() == User.UserRole.MANAGER && request.getRole() == User.UserRole.TEAM_MEMBER
                        ? creator.getId() : null)
                .isActive(true)
                .build();

        return buildUserProfile(userRepository.save(user));
    }

    public UserProfileDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildUserProfile(user);
    }

    public List<UserProfileDto> getAllUsersWithStats() {
        return userRepository.findAll().stream()
                .map(this::buildUserProfile)
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> getAllUsersWithStats(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        return userRepository.findAll(PageRequest.of(safePage, safeSize, Sort.by("fullName")))
                .getContent().stream()
                .map(this::buildUserProfile)
                .collect(Collectors.toList());
    }

    public UserProfileDto updateUserRole(UUID userId, User.UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);
        return buildUserProfile(user);
    }

    public UserProfileDto toggleUserActive(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return buildUserProfile(user);
    }

    private UserProfileDto buildUserProfile(User user) {
        List<Report> reports = reportRepository.findByUserId(user.getId());
        long total = reports.size();
        long approved = reports.stream().filter(r -> r.getStatus() == Report.ReportStatus.APPROVED).count();
        long pending = reports.stream().filter(r -> r.getStatus() == Report.ReportStatus.SUBMITTED).count();
        long needsCorrection = reports.stream().filter(r -> r.getStatus() == Report.ReportStatus.NEEDS_CORRECTION).count();
        double approvalRate = total > 0 ? (double) approved / total * 100 : 0;

        return UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
                .totalReports(total)
                .approvedReports(approved)
                .pendingReports(pending)
                .needsCorrectionReports(needsCorrection)
                .approvalRate(Math.round(approvalRate * 100.0) / 100.0)
                .build();
    }
}
