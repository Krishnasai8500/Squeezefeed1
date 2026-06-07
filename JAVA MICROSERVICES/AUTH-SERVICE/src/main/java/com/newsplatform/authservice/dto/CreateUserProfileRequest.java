package com.newsplatform.authservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserProfileRequest {

    private Long authUserId;
    private String fullName;
    private String userName;
    private String email;
    private String role;
    private String language;
    private String subscriptionPlan;
    private Boolean notificationsEnabled;
}