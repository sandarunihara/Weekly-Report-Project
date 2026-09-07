package com.example.weeklyreport.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.weeklyreport.dto.ProjectRequest;
import com.example.weeklyreport.dto.ProjectMembersRequest;
import com.example.weeklyreport.model.Project;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.security.SecurityUtils;
import com.example.weeklyreport.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects(securityUtils.getCurrentUser()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable UUID id) {
        User currentUser = securityUtils.getCurrentUser();
        Project project = projectService.getProjectById(id);
        if (currentUser.getRole() == User.UserRole.TEAM_MEMBER
                && !projectService.isMemberAssigned(id, currentUser.getId())) {
            throw new RuntimeException("You are not assigned to this project.");
        }
        return ResponseEntity.ok(project);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.ok(projectService.createProject(request, currentUser.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Project> updateProject(@PathVariable UUID id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<String> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully.");
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<UUID>> getMemberIds(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getMemberIds(id));
    }

    @PutMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<UUID>> replaceMemberAssignments(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectMembersRequest request) {
        return ResponseEntity.ok(projectService.replaceMemberAssignments(id, request.getUserIds()));
    }
}
