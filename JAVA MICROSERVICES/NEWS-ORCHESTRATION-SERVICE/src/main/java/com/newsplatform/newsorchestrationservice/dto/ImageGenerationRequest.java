package com.newsplatform.newsorchestrationservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageGenerationRequest {

    private String prompt;
    private String image_type;
    private String platform;

    @JsonProperty("source_url")
    private String sourceUrl;

    private String category;
}