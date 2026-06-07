package com.newsplatform.newsorchestrationservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrapedArticleRequest {
    private Long id;
    private String title;

    @JsonProperty("summary")        // scraper returns "summary"
    private String description;

    @JsonProperty("content")
    private String rawContent;


    @JsonProperty("source_url")     // scraper returns "source_url" not "link"
    private String sourceUrl;

    private String author;
    private String category;
    private String language;

    private List<String> tags;

    @JsonProperty("image_url")      // scraper returns "image_url" not "imageUrl"
    private String imageUrl;

    @JsonProperty("source_score")
    private Double sourceScore;

    @JsonProperty("publish_date")
    private String publishedAt;
}