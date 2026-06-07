package com.newsplatform.contentservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponseDTO {

    private Long id;

    private Long contentId;

    private Long reportedByUserId;

    private String reason;

    private String description;

    private String status;

    private LocalDateTime createdAt;
}