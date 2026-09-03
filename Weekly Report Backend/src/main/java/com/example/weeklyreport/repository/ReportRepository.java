package com.example.weeklyreport.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.weeklyreport.model.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    
    List<Report> findByUserId(UUID userId);
    Optional<Report> findByUserIdAndWeekStartDate(UUID userId, LocalDate weekStartDate);
}
