package com.example.weeklyreport.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.weeklyreport.model.ReviewAction;

@Repository
public interface ReviewActionRepository extends JpaRepository<ReviewAction, UUID> {

    List<ReviewAction> findByReportIdOrderByCreatedAtDesc(UUID reportId);

    List<ReviewAction> findAllByOrderByCreatedAtDesc();
}
