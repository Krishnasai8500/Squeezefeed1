package com.newsplatform.newsorchestrationservice.client;

import com.newsplatform.newsorchestrationservice.dto.PromptGenerationRequest;
import com.newsplatform.newsorchestrationservice.dto.PromptGenerationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PromptServiceClient {

    private final RestTemplate restTemplate;

    private static final String PROMPT_SERVICE_URL =
            "http://localhost:8004/prompt/";

    public PromptGenerationResponse generatePrompt(
            PromptGenerationRequest request
    ) {

        ResponseEntity<PromptGenerationResponse> response =
                restTemplate.postForEntity(
                        PROMPT_SERVICE_URL,
                        request,
                        PromptGenerationResponse.class
                );

        return response.getBody();
    }
}