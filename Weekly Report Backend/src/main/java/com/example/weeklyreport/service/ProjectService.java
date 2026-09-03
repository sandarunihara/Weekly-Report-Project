package com.example.weeklyreport.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.weeklyreport.dto.ProjectRequest;
import com.example.weeklyreport.model.Project;
import com.example.weeklyreport.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {
    
    private final ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
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
}
