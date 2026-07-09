package com.newsplatform.newsorchestrationservice.client;

import com.newsplatform.newsorchestrationservice.dto.ScrapedArticleRequest;
import com.newsplatform.newsorchestrationservice.dto.ScraperArticlesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ScraperServiceClient {

    private final RestTemplate restTemplate;

    //localrun
//    private static final String SCRAPER_SERVICE_URL =
//            "http://localhost:8001/scrape/articles/candidates";

    private static final String SCRAPER_SERVICE_URL =
            "http://scraper-service:8001/scrape/articles/candidates";


    public List<ScrapedArticleRequest> fetchLatestNews() {

        System.out.println("CALLING SCRAPER: " + SCRAPER_SERVICE_URL);

        ScraperArticlesResponse response =
                restTemplate.getForObject(
                        SCRAPER_SERVICE_URL,
                        ScraperArticlesResponse.class
                );

        System.out.println("SCRAPER RESPONSE RECEIVED");

        return response != null
                ? response.getArticles()
                : List.of();
    }

    public void markArticleProcessed(Long articleId) {

        //localrun
//        String url =
//                "http://localhost:8001/scrape/articles/"
//                        + articleId +
//                        "/processed";

        String url =
                "http://scraper-service:8001/scrape/articles/"
                        + articleId +
                        "/processed";

        restTemplate.put(url, null);
    }
}