package com.newsplatform.newsorchestrationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageGenerationResponse {

    private String image_path;
    private String optimized_prompt;
    private String platform;
    private String image_type;
    private Boolean saved_to_db;
}