package com.example.weeklyreport.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.weeklyreport.model.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    List<Report> findByUserId(UUID userId);

    Page<Report> findByUserId(UUID userId, Pageable pageable);

    Page<Report> findByUserIdAndStatusNot(UUID userId, Report.ReportStatus status, Pageable pageable);

    List<Report> findByUserIdAndWeekStartDate(UUID userId, LocalDate weekStartDate);

    Optional<Report> findByUserIdAndWeekStartDateAndProjectId(UUID userId, LocalDate weekStartDate, UUID projectId);

    List<Report> findByStatus(Report.ReportStatus status);

    List<Report> findByProjectId(UUID projectId);

    @Query("SELECT r FROM Report r WHERE r.weekStartDate >= :start AND r.weekEndDate <= :end")
    List<Report> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT r FROM Report r WHERE (:userId IS NULL OR r.userId = :userId) " +
           "AND (:projectId IS NULL OR r.projectId = :projectId) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:weekStart IS NULL OR r.weekStartDate >= :weekStart) " +
            "AND (:weekEnd IS NULL OR r.weekEndDate <= :weekEnd) " +
            "AND r.status <> com.example.weeklyreport.model.Report.ReportStatus.DRAFT")
    List<Report> findFiltered(@Param("userId") UUID userId,
                              @Param("projectId") UUID projectId,
                              @Param("status") Report.ReportStatus status,
                              @Param("weekStart") LocalDate weekStart,
                              @Param("weekEnd") LocalDate weekEnd);

        @Query("SELECT r FROM Report r WHERE (:userId IS NULL OR r.userId = :userId) " +
            "AND (:projectId IS NULL OR r.projectId = :projectId) " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:weekStart IS NULL OR r.weekStartDate >= :weekStart) " +
            "AND (:weekEnd IS NULL OR r.weekEndDate <= :weekEnd)")
        Page<Report> findFiltered(@Param("userId") UUID userId,
                      @Param("projectId") UUID projectId,
                      @Param("status") Report.ReportStatus status,
                      @Param("weekStart") LocalDate weekStart,
                      @Param("weekEnd") LocalDate weekEnd,
                      Pageable pageable);

    long countByStatus(Report.ReportStatus status);

    @Query("SELECT r FROM Report r WHERE r.weekStartDate = :weekStart")
    List<Report> findByWeekStartDate(@Param("weekStart") LocalDate weekStart);

    @Query("SELECT r FROM Report r ORDER BY r.updatedAt DESC")
    List<Report> findAllOrderByUpdatedAtDesc();
}
