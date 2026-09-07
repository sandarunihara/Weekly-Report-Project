package com.example.weeklyreport.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.weeklyreport.dto.ActivityFeedItemDto;
import com.example.weeklyreport.dto.DashboardSummaryDto;
import com.example.weeklyreport.dto.ReportListItemDto;
import com.example.weeklyreport.dto.SectionComparisonDto;
import com.example.weeklyreport.dto.TimeBreakdownDto;
import com.example.weeklyreport.dto.TrendDataDto;
import com.example.weeklyreport.dto.WorkloadDataDto;
import com.example.weeklyreport.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(
            @RequestParam(required = false) String weekStart) {
        return ResponseEntity.ok(dashboardService.getSummary(weekStart));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReportListItemDto>> getReports(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String weekStart,
            @RequestParam(required = false) String weekEnd) {
        return ResponseEntity.ok(dashboardService.getReportsList(userId, projectId, status, weekStart, weekEnd));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendDataDto>> getTrends(
            @RequestParam(defaultValue = "8") int weeks) {
        return ResponseEntity.ok(dashboardService.getTaskTrends(weeks));
    }

    @GetMapping("/workload")
    public ResponseEntity<List<WorkloadDataDto>> getWorkload() {
        return ResponseEntity.ok(dashboardService.getWorkloadByProject());
    }

    @GetMapping("/time-breakdown")
    public ResponseEntity<List<TimeBreakdownDto>> getTimeBreakdown() {
        return ResponseEntity.ok(dashboardService.getTimeBreakdown());
    }

    @GetMapping("/activity-feed")
    public ResponseEntity<List<ActivityFeedItemDto>> getActivityFeed(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(dashboardService.getActivityFeed(limit));
    }

    @GetMapping("/section-comparison")
    public ResponseEntity<List<SectionComparisonDto>> getSectionComparison(
            @RequestParam String weekStart,
            @RequestParam(defaultValue = "blockers") String section) {
        return ResponseEntity.ok(dashboardService.getSectionComparison(weekStart, section));
    }

    @GetMapping("/submission-status")
    public ResponseEntity<List<ReportListItemDto>> getSubmissionStatusByMember(
            @RequestParam(required = false) String weekStart) {
        return ResponseEntity.ok(dashboardService.getSubmissionStatusByMember(weekStart));
    }
}
