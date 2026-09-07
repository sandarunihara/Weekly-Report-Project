package com.example.weeklyreport.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.weeklyreport.dto.ReportSubmissionRequest;
import com.example.weeklyreport.dto.ReviewActionRequest;
import com.example.weeklyreport.model.Project;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.model.ReportAchievement;
import com.example.weeklyreport.model.ReportBlocker;
import com.example.weeklyreport.model.ReportHour;
import com.example.weeklyreport.model.ReportPlannedTask;
import com.example.weeklyreport.model.ReportTask;
import com.example.weeklyreport.model.ReportVersion;
import com.example.weeklyreport.model.ReviewAction;
import com.example.weeklyreport.repository.ProjectRepository;
import com.example.weeklyreport.repository.ProjectMemberRepository;
import com.example.weeklyreport.repository.ReportRepository;
import com.example.weeklyreport.repository.ReportVersionRepository;
import com.example.weeklyreport.repository.ReviewActionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportVersionRepository versionRepository;
    private final ReviewActionRepository reviewActionRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional
    public Report saveOrUpdateReport(UUID userId, ReportSubmissionRequest request) {

        validateProjectAssignment(userId, request.getProjectId());

        Report report = reportRepository.findByUserIdAndWeekStartDateAndProjectId(
                userId, request.getWeekStartDate(), request.getProjectId())
                .orElseGet(() -> {
                    Project project = projectRepository.findById(request.getProjectId())
                            .orElseThrow(() -> new RuntimeException("Project not found"));
                    return Report.builder()
                            .userId(userId)
                            .projectId(project.getId())
                            .weekStartDate(request.getWeekStartDate())
                            .weekEndDate(request.getWeekEndDate())
                            .status(Report.ReportStatus.DRAFT)
                            .build();
                });

        if (report.getStatus() == Report.ReportStatus.SUBMITTED || report.getStatus() == Report.ReportStatus.APPROVED) {
            throw new RuntimeException("Cannot edit a report that is already submitted or approved.");
        }

        report.setProjectId(request.getProjectId());

        int nextVersionNumber = 1;
        if (report.getId() != null) {
            ReportVersion latestVersion = versionRepository.findTopByReportIdOrderByVersionNumberDesc(report.getId()).orElse(null);
            if (latestVersion != null) {
                if (latestVersion.getSubmittedAt() == null) {
                    nextVersionNumber = latestVersion.getVersionNumber();
                    report.setCurrentVersionId(null);
                    reportRepository.saveAndFlush(report);
                    versionRepository.delete(latestVersion);
                    versionRepository.flush();
                } else {
                    nextVersionNumber = latestVersion.getVersionNumber() + 1;
                }
            }
        }

        ReportVersion newVersion = buildVersion(report, nextVersionNumber, request);

        reportRepository.save(report);
        versionRepository.save(newVersion);

        report.setCurrentVersionId(newVersion.getId());
        report.setUpdatedAt(OffsetDateTime.now());
        return reportRepository.save(report);
    }

    @Transactional
    public Report updateExistingReport(UUID userId, UUID reportId, ReportSubmissionRequest request) {
        validateProjectAssignment(userId, request.getProjectId());
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to edit this report.");
        }

        if (report.getStatus() == Report.ReportStatus.SUBMITTED || report.getStatus() == Report.ReportStatus.APPROVED) {
            throw new RuntimeException("Cannot edit a report that is already submitted or approved.");
        }

        report.setProjectId(request.getProjectId());
        report.setWeekStartDate(request.getWeekStartDate());
        report.setWeekEndDate(request.getWeekEndDate());

        int nextVersionNumber = 1;
        ReportVersion latestVersion = versionRepository.findTopByReportIdOrderByVersionNumberDesc(report.getId()).orElse(null);
        if (latestVersion != null) {
            if (latestVersion.getSubmittedAt() == null) {
                nextVersionNumber = latestVersion.getVersionNumber();
                report.setCurrentVersionId(null);
                reportRepository.saveAndFlush(report);
                versionRepository.delete(latestVersion);
                versionRepository.flush();
            } else {
                nextVersionNumber = latestVersion.getVersionNumber() + 1;
            }
        }

        ReportVersion newVersion = buildVersion(report, nextVersionNumber, request);
        versionRepository.save(newVersion);

        report.setCurrentVersionId(newVersion.getId());
        report.setUpdatedAt(OffsetDateTime.now());
        return reportRepository.save(report);
    }

    @Transactional
    public Report submitReport(UUID userId, UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to submit this report.");
        }

        if (report.getStatus() != Report.ReportStatus.DRAFT && report.getStatus() != Report.ReportStatus.NEEDS_CORRECTION) {
            throw new RuntimeException("Only DRAFT or NEEDS_CORRECTION reports can be submitted.");
        }

        report.setStatus(Report.ReportStatus.SUBMITTED);
        report.setUpdatedAt(OffsetDateTime.now());

        ReportVersion currentVersion = versionRepository.findById(report.getCurrentVersionId())
                .orElseThrow(() -> new RuntimeException("Report version not found"));
        currentVersion.setSubmittedAt(OffsetDateTime.now());
        versionRepository.save(currentVersion);

        return reportRepository.save(report);
    }

    @Transactional
    public Report reviewReport(UUID managerId, UUID reportId, ReviewActionRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (report.getStatus() != Report.ReportStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED reports can be reviewed.");
        }

        if (request.getAction() == ReviewAction.ReviewActionType.APPROVE) {
            report.setStatus(Report.ReportStatus.APPROVED);
        } else if (request.getAction() == ReviewAction.ReviewActionType.REQUEST_CHANGES) {
            if (request.getComment() == null || request.getComment().isBlank()) {
                throw new RuntimeException("A comment is required when requesting changes.");
            }
            report.setStatus(Report.ReportStatus.NEEDS_CORRECTION);
        }

        report.setUpdatedAt(OffsetDateTime.now());

        ReviewAction action = ReviewAction.builder()
                .reportId(report.getId())
                .reportVersionId(report.getCurrentVersionId())
                .reviewerId(managerId)
                .action(request.getAction())
                .comment(request.getComment())
                .build();

        reviewActionRepository.save(action);
        return reportRepository.save(report);
    }

    public List<Report> getReportsByUserId(UUID userId) {
        return reportRepository.findByUserId(userId);
    }

    public List<Report> getReportsByUserId(UUID userId, int page, int size, boolean includeDrafts) {
        if (includeDrafts) {
            return reportRepository.findByUserId(userId, pageRequest(page, size)).getContent();
        }
        return reportRepository.findByUserIdAndStatusNot(userId, Report.ReportStatus.DRAFT, pageRequest(page, size))
                .getContent();
    }

    public Report getReportById(UUID reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public List<ReportVersion> getReportVersions(UUID reportId) {
        List<ReportVersion> versions = new ArrayList<>(versionRepository.findByReportIdOrderByVersionNumberAsc(reportId));
        if (versions.isEmpty()) {
            Report report = reportRepository.findById(reportId).orElseThrow(() -> new RuntimeException("Report not found"));
            if (report.getCurrentVersionId() != null) {
                versionRepository.findById(report.getCurrentVersionId()).ifPresent(versions::add);
            }
        }
        return versions;
    }

    public List<ReviewAction> getReportReviewHistory(UUID reportId) {
        return reviewActionRepository.findByReportIdOrderByCreatedAtDesc(reportId);
    }

    public List<Report> getAllReportsFiltered(UUID projectId, String statusStr, String weekStartStr, String weekEndStr) {
        return getAllReportsFiltered(projectId, statusStr, weekStartStr, weekEndStr, 0, 50);
        }

        public List<Report> getAllReportsFiltered(UUID projectId, String statusStr, String weekStartStr, String weekEndStr,
            int page, int size) {
        Report.ReportStatus status = statusStr != null && !statusStr.isEmpty()
                ? Report.ReportStatus.valueOf(statusStr) : null;
        LocalDate weekStart = weekStartStr != null && !weekStartStr.isEmpty() ? LocalDate.parse(weekStartStr) : null;
        LocalDate weekEnd = weekEndStr != null && !weekEndStr.isEmpty() ? LocalDate.parse(weekEndStr) : null;

        return reportRepository.findFiltered(null, projectId, status, weekStart, weekEnd, pageRequest(page, size))
            .getContent();
    }

    private PageRequest pageRequest(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "weekStartDate"));
    }

    private ReportVersion buildVersion(Report report, int versionNumber, ReportSubmissionRequest request) {
        ReportVersion newVersion = ReportVersion.builder()
                .report(report)
                .versionNumber(versionNumber)
                .notes(request.getNotes())
                .links(request.getLinks() != null ? request.getLinks().toArray(new String[0]) : null)
                .build();

        if (request.getTasks() != null) {
            newVersion.setTasks(request.getTasks().stream().map(t -> ReportTask.builder()
                    .reportVersion(newVersion)
                    .taskName(t.getTaskName())
                    .priority(t.getPriority())
                    .plannedPct(t.getPlannedPct())
                    .actualPct(t.getActualPct())
                    .status(t.getStatus())
                    .timePlannedHours(t.getTimePlannedHours())
                    .timeSpentHours(t.getTimeSpentHours())
                    .outputDeliverable(t.getOutputDeliverable())
                    .sortOrder(t.getSortOrder() != null ? t.getSortOrder() : 0)
                    .build()).collect(Collectors.toList()));
        }

        if (request.getPlannedTasks() != null) {
            newVersion.setPlannedTasks(request.getPlannedTasks().stream().map(pt -> ReportPlannedTask.builder()
                    .reportVersion(newVersion)
                    .description(pt.getDescription())
                    .sortOrder(pt.getSortOrder() != null ? pt.getSortOrder() : 0)
                    .build()).collect(Collectors.toList()));
        }

        if (request.getBlockers() != null) {
            newVersion.setBlockers(request.getBlockers().stream().map(b -> ReportBlocker.builder()
                    .reportVersion(newVersion)
                    .description(b.getDescription())
                    .isKeyIssue(b.getIsKeyIssue() != null ? b.getIsKeyIssue() : false)
                    .sortOrder(b.getSortOrder() != null ? b.getSortOrder() : 0)
                    .build()).collect(Collectors.toList()));
        }

        if (request.getAchievements() != null) {
            newVersion.setAchievements(request.getAchievements().stream().map(a -> ReportAchievement.builder()
                    .reportVersion(newVersion)
                    .description(a.getDescription())
                    .isKeyAchievement(a.getIsKeyAchievement() != null ? a.getIsKeyAchievement() : false)
                    .sortOrder(a.getSortOrder() != null ? a.getSortOrder() : 0)
                    .build()).collect(Collectors.toList()));
        }

        if (request.getHoursBreakdown() != null) {
            newVersion.setHoursBreakdown(request.getHoursBreakdown().stream().map(h -> ReportHour.builder()
                    .reportVersion(newVersion)
                    .taskType(h.getTaskType())
                    .hours(h.getHours())
                    .build()).collect(Collectors.toList()));
        }

        return newVersion;
    }

    private void validateProjectAssignment(UUID userId, UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException("Project not found");
        }
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new RuntimeException("You are not assigned to this project.");
        }
    }
}
