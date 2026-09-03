package com.example.weeklyreport.dto;

import com.example.weeklyreport.model.ReviewAction.ReviewActionType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewActionRequest {
 
    @NotNull(message = "Action type is required (APPROVE or REQUEST_CHANGES)")
    private ReviewActionType action;

    private String comment;
}
