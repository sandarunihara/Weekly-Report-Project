package com.example.weeklyreport.dto;

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
public class ActivityFeedItemDto {
    private UUID reportId;
    private String reportWeek;
    private String userName;
    private String actionType;
    private String comment;
    private String timestamp;
}
