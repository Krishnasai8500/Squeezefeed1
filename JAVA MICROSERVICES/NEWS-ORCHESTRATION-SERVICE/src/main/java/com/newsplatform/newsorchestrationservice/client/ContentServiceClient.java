package com.newsplatform.newsorchestrationservice.client;

import com.newsplatform.newsorchestrationservice.config.JwtService;
import com.newsplatform.newsorchestrationservice.dto.ContentPublishRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class ContentServiceClient {

    private final RestTemplate restTemplate;
    private final JwtService jwtService;

    //localrun

//    private static final String CONTENT_SERVICE_URL =
//            "http://localhost:8083/api/content/admin";

    private static final  String CONTENT_SERVICE_URL =
            "http://content-service:8083/api/content/admin";

    public void publishContent(
            ContentPublishRequest request,
            String jwtToken
    ) {

        jwtToken =
                jwtService.generateInternalAdminToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(jwtToken);

        HttpEntity<ContentPublishRequest> entity =
                new HttpEntity<>(request, headers);

        try {
            System.out.println("CALLING CONTENT SERVICE...");

            ResponseEntity<String> response = restTemplate.exchange(
                    CONTENT_SERVICE_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            System.out.println("CONTENT SERVICE RESPONSE:");


            System.out.println(
                    "Publishing: " + request.getTitle()
            );

            System.out.println(
                    "Summary: " + request.getSummary()
            );

            System.out.println(
                    "Publish Success: " + response.getStatusCode()
            );


        } catch (Exception e) {
            System.out.println("Publish Failed:");
            e.printStackTrace();
        }
    }
}