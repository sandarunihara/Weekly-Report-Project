package com.example.weeklyreport.dto;

import java.time.LocalDate;
import java.util.List;
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
public class SectionComparisonDto {
    private UUID reportId;
    private UUID userId;
    private String userName;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private String status;
    private String section;
    private List<String> entries;
}
