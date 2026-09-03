package com.example.weeklyreport.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "report_blockers")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class ReportBlocker {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_version_id", nullable = false)
    private ReportVersion reportVersion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_key_issue", nullable = false)
    @Builder.Default
    private Boolean isKeyIssue = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}