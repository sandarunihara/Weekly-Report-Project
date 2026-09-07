package com.example.weeklyreport.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectMembersRequest {

    @NotNull
    private List<UUID> userIds;
}
