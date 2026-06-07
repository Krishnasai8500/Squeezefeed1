package com.newsplatform.newsorchestrationservice.client;

import com.newsplatform.newsorchestrationservice.dto.ImageGenerationRequest;
import com.newsplatform.newsorchestrationservice.dto.ImageGenerationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class ImageGenerationServiceClient {

    private final RestTemplate restTemplate;

    private static final String IMAGE_GENERATION_SERVICE_URL =
            "http://localhost:8005/image/";

    public ImageGenerationResponse generateImage(
            ImageGenerationRequest request
    ) {

        ResponseEntity<ImageGenerationResponse> response =
                restTemplate.postForEntity(
                        IMAGE_GENERATION_SERVICE_URL,
                        request,
                        ImageGenerationResponse.class
                );

        return response.getBody();
    }
}