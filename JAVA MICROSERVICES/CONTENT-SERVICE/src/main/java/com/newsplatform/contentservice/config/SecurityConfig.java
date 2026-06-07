package com.newsplatform.contentservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers(
                                "/api/content/trending",
                                "/api/content/category/**",
                                "/api/content/language/**",
                                "/api/content/filter",
                                "/api/content/memes",
                                "/api/content/{contentId}"
                        ).permitAll()

                        // AUTH REQUIRED
                        .requestMatchers(
                                "/api/content/feed",
                                "/api/content/comments/**",
                                "/api/content/saved/**",
                                "/api/content/*/share"
                        ).authenticated()

                        // ADMIN
                        .requestMatchers("/api/content/admin/**")
                        .hasRole("ADMIN")

                        .anyRequest().permitAll()
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}