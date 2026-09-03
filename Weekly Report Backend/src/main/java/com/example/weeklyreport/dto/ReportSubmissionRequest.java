package com.example.weeklyreport.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.weeklyreport.model.ReportTask.TaskStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportSubmissionRequest {
    
    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotNull(message = "Week start date is required")
    private LocalDate weekStartDate;

    @NotNull(message = "Week end date is required")
    private LocalDate weekEndDate;

    private String notes;
    private List<String> links;

    private List<TaskDto> tasks;
    private List<PlannedTaskDto> plannedTasks;
    private List<BlockerDto> blockers;
    private List<AchievementDto> achievements;
    private List<HourBreakdownDto> hoursBreakdown;

    @Getter @Setter
    public static class TaskDto {
        private String taskName;
        private Short priority;
        private BigDecimal plannedPct;
        private BigDecimal actualPct;
        private TaskStatus status;
        private BigDecimal timePlannedHours;
        private BigDecimal timeSpentHours;
        private String outputDeliverable;
        private Integer sortOrder;
    }

    @Getter @Setter
    public static class PlannedTaskDto {
        private String description;
        private Integer sortOrder;
    }

    @Getter @Setter
    public static class BlockerDto {
        private String description;
        private Boolean isKeyIssue;
        private Integer sortOrder;
    }

    @Getter @Setter
    public static class AchievementDto {
        private String description;
        private Boolean isKeyAchievement;
        private Integer sortOrder;
    }

    @Getter @Setter
    public static class HourBreakdownDto {
        private String taskType; // Development, Testing, Meetings, Documentation
        private BigDecimal hours;
    }
}
