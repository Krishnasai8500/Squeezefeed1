package com.newsplatform.newsorchestrationservice.controller;

import com.newsplatform.newsorchestrationservice.service.NewsOrchestrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orchestration")
@RequiredArgsConstructor
public class NewsOrchestrationController {

    private final NewsOrchestrationService newsOrchestrationService;

    @PostMapping("/ingest")
    public ResponseEntity<String> ingestAndPublishNews(
            @RequestHeader("Authorization") String authHeader
    ) {

        String jwtToken = authHeader.substring(7);

        newsOrchestrationService.ingestAndPublishNews(jwtToken);

        return ResponseEntity.ok(
                "News ingestion and publishing completed successfully"
        );
    }
}