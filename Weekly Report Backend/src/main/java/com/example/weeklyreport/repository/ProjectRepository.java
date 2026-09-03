package com.example.weeklyreport.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.weeklyreport.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    boolean existsByName(String name);
}
