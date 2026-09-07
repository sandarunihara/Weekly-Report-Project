package com.example.weeklyreport.model;

import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_tasks")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class ReportTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_version_id", nullable = false)
    @JsonIgnore
    private ReportVersion reportVersion;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    private Short priority;

    @Column(name = "planned_pct")
    private BigDecimal plannedPct;

    @Column(name = "actual_pct")
    private BigDecimal actualPct;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.NOT_STARTED;

    @Column(name = "time_planned_hours")
    private BigDecimal timePlannedHours;

    @Column(name = "time_spent_hours")
    private BigDecimal timeSpentHours;

    @Column(name = "output_deliverable", columnDefinition = "TEXT")
    private String outputDeliverable;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    public enum TaskStatus { NOT_STARTED, IN_PROGRESS, DONE, BLOCKED }
}
