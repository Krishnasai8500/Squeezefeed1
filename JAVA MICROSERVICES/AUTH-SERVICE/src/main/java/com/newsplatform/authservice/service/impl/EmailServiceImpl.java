package com.newsplatform.authservice.service.impl;

import com.newsplatform.authservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl
        implements EmailService {

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    private final RestTemplate restTemplate =
            new RestTemplate();

    @Override
    public void sendOtpEmail(
            String email,
            String otp
    ) {

        String url =
                "https://api.resend.com/emails";

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.setBearerAuth(
                apiKey
        );

        Map<String, Object> body =
                Map.of(
                        "from",
                        fromEmail,

                        "to",
                        email,

                        "subject",
                        "SqueezeFeed OTP Verification",

                        "html",
                        """
                        <h2>SqueezeFeed Verification</h2>

                        <p>Your OTP is:</p>

                        <h1>%s</h1>

                        <p>
                        This OTP expires in 10 minutes.
                        </p>
                        """
                                .formatted(otp)
                );

        HttpEntity<Map<String, Object>>
                request =
                new HttpEntity<>(
                        body,
                        headers
                );

        ResponseEntity<String>
                response =
                restTemplate.postForEntity(
                        url,
                        request,
                        String.class
                );

        System.out.println(
                "RESEND RESPONSE: "
                        + response.getBody()
        );
    }
}