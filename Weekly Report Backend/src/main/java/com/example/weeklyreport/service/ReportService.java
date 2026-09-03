package com.example.weeklyreport.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Transactional
    public Report saveOrUpdateReport(UUID userId, ReportSubmissionRequest request) {
        
        Report report = reportRepository.findByUserIdAndWeekStartDate(userId, request.getWeekStartDate())
                .orElseGet(()-> {
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

        int nextVersionNumber = 1;
        ReportVersion latestVersion = versionRepository.findTopByReportIdOrderByVersionNumberDesc(report.getId()).orElse(null);
        if (latestVersion != null) {
            nextVersionNumber = latestVersion.getVersionNumber() + 1;
        }

        ReportVersion newVersion = ReportVersion.builder()
                .report(report)
                .versionNumber(nextVersionNumber)
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

        reportRepository.save(report);
        versionRepository.save(newVersion);

        report.setCurrentVersionId(newVersion.getId());
        return reportRepository.save(report);
    }

    @Transactional
    public Report submitReport(UUID userId, UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to submit this report.");
        }

        report.setStatus(Report.ReportStatus.SUBMITTED);
        
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

        if (request.getAction() == ReviewAction.ReviewActionType.APPROVE) {
            report.setStatus(Report.ReportStatus.APPROVED);
        } else if (request.getAction() == ReviewAction.ReviewActionType.REQUEST_CHANGES) {
            if (request.getComment() == null || request.getComment().isBlank()) {
                throw new RuntimeException("A comment is required when requesting changes.");
            }
            report.setStatus(Report.ReportStatus.NEEDS_CORRECTION);
        }

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

    
}
