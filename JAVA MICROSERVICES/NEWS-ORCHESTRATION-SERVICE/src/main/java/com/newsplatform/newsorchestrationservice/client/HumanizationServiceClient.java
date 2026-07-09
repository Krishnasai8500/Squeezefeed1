package com.newsplatform.newsorchestrationservice.client;

import com.newsplatform.newsorchestrationservice.dto.HumanizationRequest;
import com.newsplatform.newsorchestrationservice.dto.ProcessedArticleResponse;
import com.newsplatform.newsorchestrationservice.dto.ScrapedArticleRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class HumanizationServiceClient {

    private final RestTemplate restTemplate;

//    localrun
//    private static final String HUMANIZATION_SERVICE_URL =
//            "http://localhost:8003/humanize/";

    private static final String HUMANIZATION_SERVICE_URL =
            "http://humanization-service:8003/humanize/";

    public ProcessedArticleResponse humanizeContent(
            ScrapedArticleRequest article
    ) {
        // Pick best available content — summary first, then full content, then title
        String contentToHumanize =
                article.getDescription() != null && !article.getDescription().isBlank()
                        ? article.getDescription()
                        : article.getRawContent() != null && !article.getRawContent().isBlank()
                        ? article.getRawContent().substring(0, Math.min(1000, article.getRawContent().length()))
                        : article.getTitle();

        HumanizationRequest request = HumanizationRequest.builder()
                .original_title(article.getTitle())
                .original_content(contentToHumanize)
                .tone("professional")
                .platform("news")
                .source_url(article.getSourceUrl())
                .category(article.getCategory())
                .build();

        ResponseEntity<ProcessedArticleResponse> response =
                restTemplate.postForEntity(
                        HUMANIZATION_SERVICE_URL,
                        request,
                        ProcessedArticleResponse.class
                );

        return response.getBody();
    }
}