package com.newsplatform.newsorchestrationservice.client;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
@Component
public class SentimentServiceClient {

    private final RestTemplate restTemplate;


    //localrun
//    private static final String SENTIMENT_SERVICE_URL =
//            "http://localhost:8002/sentiment/analyze";

    private static final String SENTIMENT_SERVICE_URL =
            "http://sentiment-service:8002/sentiment/analyze";

    public SentimentServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Double analyzeSentiment(
            String title,
            String content,
            String category,
            List<String> tags,
            String publishedAt
    ) {

        Map<String, Object> requestBody = new HashMap<>();

        requestBody.put(
                "article_title",
                title != null ? title : "News Article"
        );

        requestBody.put(
                "article_content",
                content != null ? content : "No content available"
        );

        requestBody.put(
                "category",
                category
        );

        requestBody.put(
                "tags",
                tags
        );

        requestBody.put(
                "published_at",
                publishedAt
        );

        ResponseEntity<Map> response =
                restTemplate.postForEntity(
                        SENTIMENT_SERVICE_URL,
                        requestBody,
                        Map.class
                );

        Object score = response.getBody() != null
                ? response.getBody().get("polarity_score")
                : null;

        return score != null
                ? Double.valueOf(score.toString())
                : 0.0;
    }
}