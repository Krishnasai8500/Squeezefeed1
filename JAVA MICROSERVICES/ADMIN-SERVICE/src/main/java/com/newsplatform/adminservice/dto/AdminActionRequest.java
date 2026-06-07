package com.newsplatform.adminservice.dto;

import com.newsplatform.adminservice.entity.AdminRole;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionRequest {

    private Long adminUserId;

    private AdminRole adminRole;

    @NotBlank
    private String actionType;

    @NotBlank
    private String targetType;

    private Long targetId;

    private String actionDetails;
}