package com.example.weeklyreport.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.weeklyreport.dto.ActivityFeedItemDto;
import com.example.weeklyreport.dto.DashboardSummaryDto;
import com.example.weeklyreport.dto.ReportListItemDto;
import com.example.weeklyreport.dto.SectionComparisonDto;
import com.example.weeklyreport.dto.TimeBreakdownDto;
import com.example.weeklyreport.dto.TrendDataDto;
import com.example.weeklyreport.dto.WorkloadDataDto;
import com.example.weeklyreport.model.Project;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.model.ReportHour;
import com.example.weeklyreport.model.ReportTask;
import com.example.weeklyreport.model.ReportVersion;
import com.example.weeklyreport.model.ReviewAction;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.repository.ProjectRepository;
import com.example.weeklyreport.repository.ReportRepository;
import com.example.weeklyreport.repository.ReportVersionRepository;
import com.example.weeklyreport.repository.ReviewActionRepository;
import com.example.weeklyreport.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ReportVersionRepository versionRepository;
    private final ReviewActionRepository reviewActionRepository;

    public DashboardSummaryDto getSummary(String weekStartStr) {
        LocalDate weekStart = weekStartStr != null
                ? LocalDate.parse(weekStartStr)
                : LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        List<Report> weekReports = reportRepository.findByWeekStartDate(weekStart);
        long totalTeamMembers = userRepository.countByRole(User.UserRole.TEAM_MEMBER);

        long submitted = weekReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.SUBMITTED).count();
        long approved = weekReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.APPROVED).count();
        long needsCorrection = weekReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.NEEDS_CORRECTION).count();
        long draft = weekReports.stream().filter(r -> r.getStatus() == Report.ReportStatus.DRAFT).count();

        long compliant = 0;
        long late = 0;
        long pending = 0;
        boolean weekIsPastDue = weekStart.plusDays(6).isBefore(LocalDate.now());
        for (User member : userRepository.findByRole(User.UserRole.TEAM_MEMBER)) {
            Optional<Report> memberReport = weekReports.stream()
                    .filter(report -> report.getUserId().equals(member.getId()))
                    .findFirst();
            if (memberReport.isPresent()
                    && memberReport.get().getStatus() != Report.ReportStatus.DRAFT) {
                compliant++;
            } else if (weekIsPastDue) {
                late++;
            } else {
                pending++;
            }
        }

        double complianceRate = totalTeamMembers > 0
                ? (double) compliant / totalTeamMembers * 100
                : 0;

        long openBlockers = 0;
        for (Report r : weekReports) {
            if (r.getStatus() == Report.ReportStatus.DRAFT) {
                continue;
            }
            if (r.getCurrentVersionId() != null) {
                Optional<ReportVersion> version = versionRepository.findById(r.getCurrentVersionId());
                if (version.isPresent() && version.get().getBlockers() != null) {
                    openBlockers += version.get().getBlockers().size();
                }
            }
        }

        return DashboardSummaryDto.builder()
                .totalReportsThisWeek(weekReports.size())
                .submittedCount(submitted)
                .approvedCount(approved)
                .needsCorrectionCount(needsCorrection)
                .draftCount(draft)
                .pendingCount(pending)
                .lateCount(late)
                .complianceRate(Math.round(complianceRate * 100.0) / 100.0)
                .openBlockersCount(openBlockers)
                .totalTeamMembers(totalTeamMembers)
                .build();
    }

    public List<ReportListItemDto> getReportsList(String userIdStr, String projectIdStr,
                                                   String statusStr, String weekStartStr, String weekEndStr) {
        UUID userId = userIdStr != null && !userIdStr.isEmpty() ? UUID.fromString(userIdStr) : null;
        UUID projectId = projectIdStr != null && !projectIdStr.isEmpty() ? UUID.fromString(projectIdStr) : null;
        Report.ReportStatus status = statusStr != null && !statusStr.isEmpty()
                ? Report.ReportStatus.valueOf(statusStr) : null;
        LocalDate weekStart = weekStartStr != null && !weekStartStr.isEmpty() ? LocalDate.parse(weekStartStr) : null;
        LocalDate weekEnd = weekEndStr != null && !weekEndStr.isEmpty() ? LocalDate.parse(weekEndStr) : null;

        List<Report> reports = reportRepository.findFiltered(userId, projectId, status, weekStart, weekEnd);
        return reports.stream()
                .filter(r -> r.getStatus() != Report.ReportStatus.DRAFT)
                .map(this::toReportListItem)
                .collect(Collectors.toList());
    }

    public List<TrendDataDto> getTaskTrends(int weeks) {
        List<TrendDataDto> trends = new ArrayList<>();
        LocalDate currentMonday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate weekStart = currentMonday.minusWeeks(i);
            List<Report> weekReports = reportRepository.findByWeekStartDate(weekStart);

            long tasksCompleted = 0;
            for (Report r : weekReports) {
                if (r.getStatus() == Report.ReportStatus.DRAFT) {
                    continue;
                }
                if (r.getCurrentVersionId() != null) {
                    Optional<ReportVersion> version = versionRepository.findById(r.getCurrentVersionId());
                    if (version.isPresent() && version.get().getTasks() != null) {
                        tasksCompleted += version.get().getTasks().stream()
                                .filter(t -> t.getStatus() == ReportTask.TaskStatus.DONE)
                                .count();
                    }
                }
            }

            long reportsSubmitted = weekReports.stream()
                    .filter(r -> r.getStatus() != Report.ReportStatus.DRAFT)
                    .count();
            long reportsApproved = weekReports.stream()
                    .filter(r -> r.getStatus() == Report.ReportStatus.APPROVED)
                    .count();

            trends.add(TrendDataDto.builder()
                    .label(weekStart.toString())
                    .tasksCompleted(tasksCompleted)
                    .reportsSubmitted(reportsSubmitted)
                    .reportsApproved(reportsApproved)
                    .build());
        }

        return trends;
    }

    public List<WorkloadDataDto> getWorkloadByProject() {
        List<Project> projects = projectRepository.findAll();
        List<WorkloadDataDto> workload = new ArrayList<>();

        for (Project project : projects) {
            List<Report> projectReports = reportRepository.findByProjectId(project.getId());
            long taskCount = 0;
            double totalHours = 0;

            for (Report r : projectReports) {
                if (r.getStatus() == Report.ReportStatus.DRAFT) {
                    continue;
                }
                if (r.getCurrentVersionId() != null) {
                    Optional<ReportVersion> version = versionRepository.findById(r.getCurrentVersionId());
                    if (version.isPresent()) {
                        if (version.get().getTasks() != null) {
                            taskCount += version.get().getTasks().size();
                        }
                        if (version.get().getHoursBreakdown() != null) {
                            totalHours += version.get().getHoursBreakdown().stream()
                                    .map(ReportHour::getHours)
                                    .filter(h -> h != null)
                                    .mapToDouble(BigDecimal::doubleValue)
                                    .sum();
                        }
                    }
                }
            }

            if (taskCount > 0 || totalHours > 0) {
                workload.add(WorkloadDataDto.builder()
                        .projectName(project.getName())
                        .taskCount(taskCount)
                        .totalHours(totalHours)
                        .build());
            }
        }

        return workload;
    }

    public List<TimeBreakdownDto> getTimeBreakdown() {
        Map<String, Double> breakdown = new HashMap<>();
        List<Report> allReports = reportRepository.findAll();

        for (Report r : allReports) {
            if (r.getStatus() == Report.ReportStatus.DRAFT) {
                continue;
            }
            if (r.getCurrentVersionId() != null) {
                Optional<ReportVersion> version = versionRepository.findById(r.getCurrentVersionId());
                if (version.isPresent() && version.get().getHoursBreakdown() != null) {
                    for (ReportHour hour : version.get().getHoursBreakdown()) {
                        breakdown.merge(hour.getTaskType(),
                                hour.getHours() != null ? hour.getHours().doubleValue() : 0,
                                Double::sum);
                    }
                }
            }
        }

        return breakdown.entrySet().stream()
                .map(e -> TimeBreakdownDto.builder()
                        .taskType(e.getKey())
                        .totalHours(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ActivityFeedItemDto> getActivityFeed(int limit) {
        List<ReviewAction> actions = reviewActionRepository.findAllByOrderByCreatedAtDesc();
        List<ActivityFeedItemDto> feed = new ArrayList<>();

        for (ReviewAction action : actions) {
            if (feed.size() >= limit) break;

            Optional<Report> report = reportRepository.findById(action.getReportId());
            Optional<User> reviewer = userRepository.findById(action.getReviewerId());

            String reportWeek = report.map(r -> r.getWeekStartDate().toString() + " - " + r.getWeekEndDate().toString())
                    .orElse("Unknown");
            String userName = reviewer.map(User::getFullName).orElse("Unknown");

            feed.add(ActivityFeedItemDto.builder()
                    .reportId(action.getReportId())
                    .reportWeek(reportWeek)
                    .userName(userName)
                    .actionType(action.getAction().name())
                    .comment(action.getComment())
                    .timestamp(action.getCreatedAt() != null ? action.getCreatedAt().toString() : "")
                    .build());
        }

        List<Report> recentReports = reportRepository.findAllOrderByUpdatedAtDesc();
        for (Report report : recentReports) {
            if (feed.size() >= limit) break;
            if (report.getStatus() == Report.ReportStatus.SUBMITTED) {
                Optional<User> user = userRepository.findById(report.getUserId());
                feed.add(ActivityFeedItemDto.builder()
                        .reportId(report.getId())
                        .reportWeek(report.getWeekStartDate().toString() + " - " + report.getWeekEndDate().toString())
                        .userName(user.map(User::getFullName).orElse("Unknown"))
                        .actionType("SUBMITTED")
                        .comment(null)
                        .timestamp(report.getUpdatedAt() != null ? report.getUpdatedAt().toString() : "")
                        .build());
            }
        }

        feed.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return feed.stream().limit(limit).collect(Collectors.toList());
    }

    public List<SectionComparisonDto> getSectionComparison(String weekStartStr, String section) {
        LocalDate weekStart = LocalDate.parse(weekStartStr);
        List<Report> weekReports = reportRepository.findByWeekStartDate(weekStart);
        String normalizedSection = section == null ? "blockers" : section.toLowerCase();
        if (!List.of("blockers", "achievements", "planned_tasks", "tasks").contains(normalizedSection)) {
            throw new IllegalArgumentException("Section must be blockers, achievements, planned_tasks, or tasks.");
        }

        return weekReports.stream()
                .filter(report -> report.getStatus() != Report.ReportStatus.DRAFT)
                .map(report -> toSectionComparison(report, normalizedSection))
                .collect(Collectors.toList());
    }

    private SectionComparisonDto toSectionComparison(Report report, String section) {
        List<String> entries = new ArrayList<>();
        if (report.getCurrentVersionId() != null) {
            versionRepository.findById(report.getCurrentVersionId()).ifPresent(version -> {
                if ("blockers".equals(section) && version.getBlockers() != null) {
                    version.getBlockers().forEach(blocker -> entries.add(
                            (Boolean.TRUE.equals(blocker.getIsKeyIssue()) ? "[Key] " : "") + blocker.getDescription()));
                } else if ("achievements".equals(section) && version.getAchievements() != null) {
                    version.getAchievements().forEach(achievement -> entries.add(
                            (Boolean.TRUE.equals(achievement.getIsKeyAchievement()) ? "[Key] " : "") + achievement.getDescription()));
                } else if ("planned_tasks".equals(section) && version.getPlannedTasks() != null) {
                    version.getPlannedTasks().forEach(task -> entries.add(task.getDescription()));
                } else if ("tasks".equals(section) && version.getTasks() != null) {
                    version.getTasks().forEach(task -> entries.add(task.getTaskName() + " (" + task.getStatus() + ")"));
                }
            });
        }

        User user = userRepository.findById(report.getUserId()).orElse(null);
        return SectionComparisonDto.builder()
                .reportId(report.getId())
                .userId(report.getUserId())
                .userName(user != null ? user.getFullName() : "Unknown")
                .weekStartDate(report.getWeekStartDate())
                .weekEndDate(report.getWeekEndDate())
                .status(report.getStatus().name())
                .section(section)
                .entries(entries)
                .build();
    }

    public List<ReportListItemDto> getSubmissionStatusByMember(String weekStartStr) {
        LocalDate weekStart = weekStartStr != null
                ? LocalDate.parse(weekStartStr)
                : LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        List<User> teamMembers = userRepository.findByRole(User.UserRole.TEAM_MEMBER);
        List<ReportListItemDto> result = new ArrayList<>();

        for (User member : teamMembers) {
            List<Report> reports = reportRepository.findByUserIdAndWeekStartDate(member.getId(), weekStart);
            if (!reports.isEmpty()) {
                Report report = reports.stream()
                        .sorted((left, right) -> Integer.compare(statusPriority(right.getStatus()), statusPriority(left.getStatus())))
                        .findFirst()
                        .orElse(reports.get(0));
                result.add(toReportListItem(report));
            } else {
                result.add(ReportListItemDto.builder()
                        .userId(member.getId())
                        .userName(member.getFullName())
                        .userEmail(member.getEmail())
                        .weekStartDate(weekStart)
                        .weekEndDate(weekStart.plusDays(6))
                        .status("NOT_STARTED")
                        .versionCount(0)
                        .build());
            }
        }

        return result;
    }

    private int statusPriority(Report.ReportStatus status) {
        return switch (status) {
            case SUBMITTED -> 4;
            case NEEDS_CORRECTION -> 3;
            case APPROVED -> 2;
            case DRAFT -> 1;
        };
    }

    private ReportListItemDto toReportListItem(Report report) {
        Optional<User> user = userRepository.findById(report.getUserId());
        Optional<Project> project = report.getProjectId() != null
                ? projectRepository.findById(report.getProjectId())
                : Optional.empty();

        List<ReviewAction> reviews = reviewActionRepository.findByReportIdOrderByCreatedAtDesc(report.getId());
        String latestComment = reviews.isEmpty() ? null : reviews.get(0).getComment();

        int versionCount = (int) versionRepository.countByReportId(report.getId());

        return ReportListItemDto.builder()
                .id(report.getId())
                .userId(report.getUserId())
                .userName(user.map(User::getFullName).orElse("Unknown"))
                .userEmail(user.map(User::getEmail).orElse(""))
                .projectId(report.getProjectId())
                .projectName(project.map(Project::getName).orElse(""))
                .weekStartDate(report.getWeekStartDate())
                .weekEndDate(report.getWeekEndDate())
                .status(report.getStatus().name())
                .versionCount(versionCount)
                .createdAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : "")
                .updatedAt(report.getUpdatedAt() != null ? report.getUpdatedAt().toString() : "")
                .latestReviewComment(latestComment)
                .build();
    }
}
