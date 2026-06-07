package com.newsplatform.newsorchestrationservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentPublishRequest {

    private String title;
    private String description;
    private String fullContent;
    private String summary;
    private String author;
    private String sourceUrl;
    private String category;
    private String language;
    private List<String> tags;
    private String imageUrl;
    private Boolean isPublished;
    private Boolean isTrending;
    private Double viralScore;
    private Map<String, String> translatedTitle;

    private Map<String, String> translatedSummary;
    private String storyFingerprint;
}