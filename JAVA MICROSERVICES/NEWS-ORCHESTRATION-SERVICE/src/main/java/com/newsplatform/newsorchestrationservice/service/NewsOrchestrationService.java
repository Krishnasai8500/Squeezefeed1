package com.newsplatform.newsorchestrationservice.service;

public interface NewsOrchestrationService {

    void ingestAndPublishNews(String jwtToken);
}