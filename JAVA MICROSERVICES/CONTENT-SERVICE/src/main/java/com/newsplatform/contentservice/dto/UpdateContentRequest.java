package com.newsplatform.contentservice.dto;

import com.newsplatform.contentservice.entity.Language;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateContentRequest {

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
}