package com.newsplatform.adminservice.dto;

import com.newsplatform.adminservice.entity.AdminRole;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionResponse {

    private Long id;

    private Long adminUserId;

    private AdminRole adminRole;

    private String actionType;

    private String targetType;

    private Long targetId;

    private String actionDetails;

    private Boolean successful;

    private LocalDateTime createdAt;
}