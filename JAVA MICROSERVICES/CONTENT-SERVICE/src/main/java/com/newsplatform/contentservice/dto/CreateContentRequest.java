package com.newsplatform.contentservice.dto;

import com.newsplatform.contentservice.entity.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateContentRequest {

    @NotBlank
    private String title;

    private String description;

    private String fullContent;

    private String summary;


    private Map<String, String> translatedTitle;

    private Map<String, String> translatedSummary;

    private String author;

    private String sourceUrl;

    @NotBlank
    private String category;

    @NotNull
    private Language language;

    private List<String> tags;

    private String imageUrl;

    private Boolean isPublished;


}