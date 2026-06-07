package com.newsplatform.analyticsservice.service.impl;

import com.newsplatform.analyticsservice.dto.AnalyticsRequest;
import com.newsplatform.analyticsservice.dto.AnalyticsResponse;
import com.newsplatform.analyticsservice.entity.AnalyticsType;
import com.newsplatform.analyticsservice.entity.ContentAnalytics;
import com.newsplatform.analyticsservice.repository.ContentAnalyticsRepository;
import com.newsplatform.analyticsservice.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ContentAnalyticsRepository repository;

    @Override
    public AnalyticsResponse trackAnalytics(AnalyticsRequest request) {

        ContentAnalytics analytics = ContentAnalytics.builder()
                .contentId(request.getContentId())
                .userId(request.getUserId())
                .analyticsType(request.getAnalyticsType())
                .metricValue(request.getMetricValue())
                .category(request.getCategory())
                .source(request.getSource())
                .build();

        ContentAnalytics saved = repository.save(analytics);

        return mapToResponse(saved);
    }

    @Override
    public List<AnalyticsResponse> getAllAnalytics() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AnalyticsResponse> getAnalyticsByContentId(Long contentId) {
        return repository.findByContentId(contentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AnalyticsResponse> getAnalyticsByUserId(Long userId) {
        return repository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AnalyticsResponse> getAnalyticsByType(String analyticsType) {
        return repository.findByAnalyticsType(
                        AnalyticsType.valueOf(
                                analyticsType.toUpperCase()
                        )
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AnalyticsResponse mapToResponse(
            ContentAnalytics analytics
    ) {
        return AnalyticsResponse.builder()
                .id(analytics.getId())
                .contentId(analytics.getContentId())
                .userId(analytics.getUserId())
                .analyticsType(analytics.getAnalyticsType())
                .metricValue(analytics.getMetricValue())
                .category(analytics.getCategory())
                .source(analytics.getSource())
                .createdAt(analytics.getCreatedAt())
                .build();
    }
}