package com.example.weeklyreport.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.weeklyreport.dto.ReportSubmissionRequest;
import com.example.weeklyreport.dto.ReviewActionRequest;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.service.ReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    
    private final ReportService reportService;

    @PostMapping("/draft")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<Report> saveOrUpdateDraft(
            @RequestParam UUID userId,
            @Valid @RequestBody ReportSubmissionRequest request) {
        Report report = reportService.saveOrUpdateReport(userId, request);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{reportId}/submit")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<Report> submitReport(
            @RequestParam UUID userId,
            @PathVariable UUID reportId) {
        Report report = reportService.submitReport(userId, reportId);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{reportId}/review")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Report> reviewReport(
            @RequestParam UUID managerId,
            @PathVariable UUID reportId,
            @Valid @RequestBody ReviewActionRequest request) {
        Report report = reportService.reviewReport(managerId, reportId, request);
        return ResponseEntity.ok(report);
    }
}
