package com.example.weeklyreport.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.weeklyreport.model.ProjectMember;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {

    List<ProjectMember> findByProjectId(UUID projectId);

    List<ProjectMember> findByUserId(UUID userId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    @Modifying
    void deleteByProjectId(UUID projectId);

    @Query("select pm.projectId from ProjectMember pm where pm.userId = :userId")
    List<UUID> findProjectIdsByUserId(@Param("userId") UUID userId);
}
