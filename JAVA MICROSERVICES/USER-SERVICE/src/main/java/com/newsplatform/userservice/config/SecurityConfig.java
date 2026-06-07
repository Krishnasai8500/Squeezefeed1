package com.newsplatform.userservice.config;

import com.newsplatform.userservice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // Health
                        .requestMatchers("/actuator/**")
                        .permitAll()

                        .requestMatchers(
                                "/api/users/preferences/category/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/users/language/**"
                        )
                        .permitAll()

                        // Internal create profile
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users/profile"
                        ).permitAll()

                        // Onboarding update
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/profile/**"
                        ).authenticated()

                        // Saved articles
                        .requestMatchers("/api/users/saved/**")
                        .authenticated()

                        // Save / unsave
                        .requestMatchers("/api/users/save/**")
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users/track/share/**"
                        )
                        .permitAll()

                        // Tracking
                        .requestMatchers("/api/users/track/**")
                        .authenticated()

                        // Profile likes
                        .requestMatchers("/api/users/profile-like/**")
                        .authenticated()

                        // Everything else
                        .anyRequest()
                        .authenticated()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}