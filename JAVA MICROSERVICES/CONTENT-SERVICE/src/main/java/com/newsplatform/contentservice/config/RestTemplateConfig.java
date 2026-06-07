package com.newsplatform.contentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.util.List;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        // ✅ Intercept every outgoing RestTemplate call and forward the JWT
        // This covers ALL future inter-service calls — no changes needed per endpoint
        restTemplate.setInterceptors(List.of(new JwtForwardingInterceptor()));

        return restTemplate;
    }

    /**
     * Automatically forwards the Authorization header from the incoming
     * HTTP request to every outgoing RestTemplate call.
     *
     * Flow:
     *   Frontend → API Gateway (JWT) → Content Service → [this interceptor] → User Service / Media Service
     *
     * As long as the incoming request has a Bearer token, every downstream
     * service call will carry it automatically.
     */
    static class JwtForwardingInterceptor implements ClientHttpRequestInterceptor {

        @Override
        public ClientHttpResponse intercept(
                HttpRequest request,
                byte[] body,
                ClientHttpRequestExecution execution
        ) throws IOException {

            // Grab the current incoming HTTP request from thread-local context
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                String authHeader = attributes
                        .getRequest()
                        .getHeader(HttpHeaders.AUTHORIZATION);

                // Forward the JWT only if present
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    request.getHeaders().set(
                            HttpHeaders.AUTHORIZATION,
                            authHeader
                    );
                }
            }

            return execution.execute(request, body);
        }
    }
}