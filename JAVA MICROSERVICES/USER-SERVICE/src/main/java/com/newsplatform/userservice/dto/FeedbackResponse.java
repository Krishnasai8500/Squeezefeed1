package com.newsplatform.userservice.dto;

import lombok.*;

import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackResponse {

    private Long id;

    private Long authUserId;

    private String userName;

    private String email;

    private String category;

    private String message;

    private LocalDateTime createdAt;
}