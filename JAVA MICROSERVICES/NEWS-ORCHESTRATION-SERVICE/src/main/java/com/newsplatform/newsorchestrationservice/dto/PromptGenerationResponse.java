package com.newsplatform.newsorchestrationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromptGenerationResponse {

    private String generated_prompt;
    private String optimized_prompt;
    private String platform;
    private String content_type;
    private Boolean saved_to_db;
}