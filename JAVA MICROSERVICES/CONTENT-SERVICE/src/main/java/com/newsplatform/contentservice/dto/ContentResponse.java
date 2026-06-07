package com.newsplatform.contentservice.dto;

import com.newsplatform.contentservice.entity.Language;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.*;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentResponse {

    private Long id;

    private String title;

    private String description;

    private String fullContent;

    private String summary;

    private String author;

    private String sourceUrl;

    private String category;

    private Language language;

    private List<String> tags;

    private String imageUrl;

    private Boolean isPublished;

    private Boolean isTrending;

    private LocalDateTime publishedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    private Integer commentCount;
    private String articleCity;

    private String articleState;

    private Map<String, String> translatedTitle;

    private Map<String, String> translatedSummary;
}