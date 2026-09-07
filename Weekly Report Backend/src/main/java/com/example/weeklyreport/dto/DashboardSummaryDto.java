package com.example.weeklyreport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalReportsThisWeek;
    private long submittedCount;
    private long pendingCount;
    private long approvedCount;
    private long needsCorrectionCount;
    private long draftCount;
    private long lateCount;
    private double complianceRate;
    private long openBlockersCount;
    private long totalTeamMembers;
}
