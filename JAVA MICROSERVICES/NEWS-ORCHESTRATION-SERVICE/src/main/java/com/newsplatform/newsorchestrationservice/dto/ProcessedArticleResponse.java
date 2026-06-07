package com.newsplatform.newsorchestrationservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.*;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedArticleResponse {

    @JsonProperty("rewritten_content")
    private String rewritten_content;

    private String viral_headline;
    private String tone;
    private String platform;
    private Boolean saved_to_db;

    private String category;

    private List<String> tags;

    @JsonProperty("translations")
    private Map<String, Map<String, String>> translations;
}