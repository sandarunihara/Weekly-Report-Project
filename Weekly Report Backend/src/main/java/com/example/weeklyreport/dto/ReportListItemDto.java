package com.example.weeklyreport.dto;

import java.time.LocalDate;
import java.util.UUID;

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
public class ReportListItemDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private UUID projectId;
    private String projectName;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private String status;
    private int versionCount;
    private String createdAt;
    private String updatedAt;
    private String latestReviewComment;
}
