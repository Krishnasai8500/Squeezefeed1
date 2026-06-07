package com.newsplatform.analyticsservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_analytics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long contentId;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private AnalyticsType analyticsType;

    private Integer metricValue;

    private String category;

    private String source;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.metricValue == null) {
            this.metricValue = 1;
        }
    }
}