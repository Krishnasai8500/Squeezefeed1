package com.newsplatform.newsorchestrationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HumanizationRequest {

    private String original_title;
    private String original_content;
    private String tone;
    private String platform;
    private String source_url;
    private String category;
}