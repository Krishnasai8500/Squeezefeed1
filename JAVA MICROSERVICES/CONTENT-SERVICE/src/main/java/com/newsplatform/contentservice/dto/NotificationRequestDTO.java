package com.newsplatform.contentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDTO {

    private Long userId;

    private String title;

    private String message;

    private String type;

    private String deliveryChannel;

    private Long contentId;
}
