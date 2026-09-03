package com.example.weeklyreport.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "report_achievements")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class ReportAchievement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_version_id", nullable = false)
    private ReportVersion reportVersion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_key_achievement", nullable = false)
    @Builder.Default
    private Boolean isKeyAchievement = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
