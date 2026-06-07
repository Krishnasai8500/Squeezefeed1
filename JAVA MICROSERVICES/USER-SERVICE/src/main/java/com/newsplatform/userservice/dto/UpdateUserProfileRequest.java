package com.newsplatform.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserProfileRequest {


    private String fullName;

    private String userName;

    @NotBlank(message = "Language is required")
    private String language;

    private List<String> preferredCategories;

    @NotBlank(message = "Subscription plan is required")
    private String subscriptionPlan;

    private Boolean notificationsEnabled;
    private Long authUserId;

    private String city;

    private String state;

    private String country;

    private Boolean onboardingCompleted;

}