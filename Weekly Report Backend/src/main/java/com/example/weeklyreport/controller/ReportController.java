package com.example.weeklyreport.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

import com.example.weeklyreport.dto.ReportSubmissionRequest;
import com.example.weeklyreport.dto.ReviewActionRequest;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.model.ReportVersion;
import com.example.weeklyreport.model.ReviewAction;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.security.SecurityUtils;
import com.example.weeklyreport.service.ReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final SecurityUtils securityUtils;

    @PostMapping("/draft")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<Report> saveOrUpdateDraft(
            @Valid @RequestBody ReportSubmissionRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Report report = reportService.saveOrUpdateReport(currentUser.getId(), request);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{reportId}/submit")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<Report> submitReport(@PathVariable UUID reportId) {
        User currentUser = securityUtils.getCurrentUser();
        Report report = reportService.submitReport(currentUser.getId(), reportId);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{reportId}/review")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Report> reviewReport(
            @PathVariable UUID reportId,
            @Valid @RequestBody ReviewActionRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Report report = reportService.reviewReport(currentUser.getId(), reportId, request);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<List<Report>> getMyReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        User currentUser = securityUtils.getCurrentUser();
        List<Report> reports = reportService.getReportsByUserId(currentUser.getId(), page, size, true);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<Report>> getReportsByUserId(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<Report> reports = reportService.getReportsByUserId(userId, page, size, false);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<Report> getReportById(@PathVariable UUID reportId) {
        User currentUser = securityUtils.getCurrentUser();
        Report report = reportService.getReportById(reportId);
        if (report.getStatus() == Report.ReportStatus.DRAFT
                && !report.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("Draft reports are only visible to their owner.");
        }
        if (currentUser.getRole() == User.UserRole.TEAM_MEMBER && !report.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to view this report.");
        }
        return ResponseEntity.ok(report);
    }

    @GetMapping("/{reportId}/versions")
    public ResponseEntity<List<ReportVersion>> getReportVersions(@PathVariable UUID reportId) {
        User currentUser = securityUtils.getCurrentUser();
        Report report = reportService.getReportById(reportId);
        if (report.getStatus() == Report.ReportStatus.DRAFT
                && !report.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("Draft reports are only visible to their owner.");
        }
        if (currentUser.getRole() == User.UserRole.TEAM_MEMBER && !report.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to view this report.");
        }
        List<ReportVersion> versions = reportService.getReportVersions(reportId);
        if (currentUser.getRole() == User.UserRole.MANAGER || currentUser.getRole() == User.UserRole.ADMIN) {
            versions = versions.stream()
                    .filter(version -> version.getSubmittedAt() != null)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/{reportId}/reviews")
    public ResponseEntity<List<ReviewAction>> getReportReviewHistory(@PathVariable UUID reportId) {
        User currentUser = securityUtils.getCurrentUser();
        Report report = reportService.getReportById(reportId);
        if (report.getStatus() == Report.ReportStatus.DRAFT
                && !report.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("Draft reports are only visible to their owner.");
        }
        if (currentUser.getRole() == User.UserRole.TEAM_MEMBER && !report.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to view this report.");
        }
        List<ReviewAction> reviews = reportService.getReportReviewHistory(reportId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<Report>> getAllReports(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String weekStart,
            @RequestParam(required = false) String weekEnd,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<Report> reports = reportService.getAllReportsFiltered(projectId, status, weekStart, weekEnd, page, size);
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{reportId}")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<Report> updateReport(
            @PathVariable UUID reportId,
            @Valid @RequestBody ReportSubmissionRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Report report = reportService.updateExistingReport(currentUser.getId(), reportId, request);
        return ResponseEntity.ok(report);
    }
}
