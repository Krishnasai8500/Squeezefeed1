package com.newsplatform.newsorchestrationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScraperArticlesResponse {

    private Integer count;
    private List<ScrapedArticleRequest> articles;
}