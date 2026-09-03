package com.example.weeklyreport.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.weeklyreport.model.ReportVersion;

@Repository
public interface ReportVersionRepository extends JpaRepository<ReportVersion, UUID>{
    
    Optional<ReportVersion>findTopByReportIdOrderByVersionNumberDesc(UUID reportId);

    List<ReportVersion> findByReportIdOrderByVersionNumberAsc(UUID reportId);
}
