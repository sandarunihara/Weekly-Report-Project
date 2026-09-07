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
public class TrendDataDto {
    private String label;
    private long tasksCompleted;
    private long reportsSubmitted;
    private long reportsApproved;
}
