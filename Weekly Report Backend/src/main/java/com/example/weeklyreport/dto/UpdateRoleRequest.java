package com.example.weeklyreport.dto;

import com.example.weeklyreport.model.User;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateRoleRequest {
    @NotNull(message = "Role is required")
    private User.UserRole role;
}
