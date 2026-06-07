package com.newsplatform.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserProfileRequest {

    private Long authUserId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank
    private String userName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Language is required")
    private String language;

    private List<String> preferredCategories;

    @NotBlank(message = "Subscription plan is required")
    private String subscriptionPlan;

    private Boolean notificationsEnabled;

}