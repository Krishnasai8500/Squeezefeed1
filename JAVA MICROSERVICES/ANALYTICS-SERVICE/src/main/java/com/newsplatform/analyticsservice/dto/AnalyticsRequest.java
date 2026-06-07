package com.newsplatform.analyticsservice.dto;

import com.newsplatform.analyticsservice.entity.AnalyticsType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsRequest {

    @NotNull
    private Long contentId;

    private Long userId;

    @NotNull
    private AnalyticsType analyticsType;

    private Integer metricValue;

    private String category;

    private String source;
}