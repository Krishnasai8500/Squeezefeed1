package com.newsplatform.analyticsservice.service;

import com.newsplatform.analyticsservice.dto.AnalyticsRequest;
import com.newsplatform.analyticsservice.dto.AnalyticsResponse;

import java.util.List;

public interface AnalyticsService {

    AnalyticsResponse trackAnalytics(AnalyticsRequest request);

    List<AnalyticsResponse> getAllAnalytics();

    List<AnalyticsResponse> getAnalyticsByContentId(Long contentId);

    List<AnalyticsResponse> getAnalyticsByUserId(Long userId);

    List<AnalyticsResponse> getAnalyticsByType(String analyticsType);
}