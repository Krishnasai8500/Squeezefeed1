package com.newsplatform.notificationservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDTO {

    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;
    private String deliveryChannel;
    private String status;
    private Boolean isRead;
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private Long contentId;
}