package com.example.weeklyreport.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

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
public class UserProfileDto {
    private UUID id;
    private String fullName;
    private String email;
    private String role;
    @JsonProperty("isActive")
    private boolean isActive;
    private String createdAt;
    private long totalReports;
    private long approvedReports;
    private long pendingReports;
    private long needsCorrectionReports;
    private double approvalRate;
}
