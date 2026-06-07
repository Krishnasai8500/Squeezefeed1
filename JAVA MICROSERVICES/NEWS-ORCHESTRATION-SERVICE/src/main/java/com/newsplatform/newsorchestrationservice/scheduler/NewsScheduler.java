package com.newsplatform.newsorchestrationservice.scheduler;

import com.newsplatform.newsorchestrationservice.service.impl.NewsOrchestrationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NewsScheduler {

    private final NewsOrchestrationServiceImpl newsOrchestrationService;

    @Scheduled(fixedRate = 60 * 60 * 1000)
    public void autoIngestNews() {

        System.out.println("AUTO INGESTION STARTED");

        try {

            newsOrchestrationService.ingestAndPublishNews(
                    "YOUR_JWT_TOKEN"
            );

            System.out.println("AUTO INGESTION COMPLETED");

        } catch (Exception e) {

            System.out.println("AUTO INGESTION FAILED");

            e.printStackTrace();
        }
    }
}