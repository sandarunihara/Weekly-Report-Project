package com.example.weeklyreport.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.weeklyreport.dto.ProjectRequest;
import com.example.weeklyreport.model.Project;
import com.example.weeklyreport.model.ProjectMember;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.repository.ProjectRepository;
import com.example.weeklyreport.repository.ProjectMemberRepository;
import com.example.weeklyreport.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public List<Project> getAllProjects(User currentUser) {
        if (currentUser.getRole() == User.UserRole.MANAGER || currentUser.getRole() == User.UserRole.ADMIN) {
            return projectRepository.findAll();
        }
        return projectRepository.findAllById(projectMemberRepository.findProjectIdsByUserId(currentUser.getId()));
    }

    public Project getProjectById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + id));
    }

    public Project createProject(ProjectRequest request, UUID userId){
        if(projectRepository.existsByName(request.getName())){
            throw new RuntimeException("Project with the same name already exists");
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(userId)
                .isActive(true)
                .build();
        return projectRepository.save(project);
    }

    public Project updateProject(UUID id, ProjectRequest request) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getName().equals(request.getName()) && projectRepository.existsByName(request.getName())) {
            throw new RuntimeException("Project with the same name already exists");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return projectRepository.save(project);
    }

    public void deleteProject(UUID id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        projectRepository.delete(project);
    }

    public List<UUID> getMemberIds(UUID projectId) {
        getProjectById(projectId);
        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(ProjectMember::getUserId)
                .toList();
    }

    @jakarta.transaction.Transactional
    public List<UUID> replaceMemberAssignments(UUID projectId, List<UUID> userIds) {
        getProjectById(projectId);
        List<UUID> validMemberIds = userRepository.findAllById(userIds).stream()
                .filter(user -> user.getRole() == User.UserRole.TEAM_MEMBER)
                .map(User::getId)
                .toList();

        projectMemberRepository.deleteByProjectId(projectId);
        projectMemberRepository.saveAll(validMemberIds.stream()
                .map(userId -> ProjectMember.builder().projectId(projectId).userId(userId).build())
                .toList());
        return validMemberIds;
    }

    public boolean isMemberAssigned(UUID projectId, UUID userId) {
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }
}
