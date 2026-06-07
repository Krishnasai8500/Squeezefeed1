package com.newsplatform.analyticsservice.dto;

import com.newsplatform.analyticsservice.entity.AnalyticsType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private Long id;

    private Long contentId;

    private Long userId;

    private AnalyticsType analyticsType;

    private Integer metricValue;

    private String category;

    private String source;

    private LocalDateTime createdAt;
}