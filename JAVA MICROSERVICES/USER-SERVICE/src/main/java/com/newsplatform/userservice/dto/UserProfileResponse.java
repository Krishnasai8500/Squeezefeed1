package com.newsplatform.userservice.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long id;
    private Long authUserId;
    private String fullName;
    private String userName;
    private String email;
    private String role;
    private String language;
    private List<String> preferredCategories;
    private String subscriptionPlan;
    private Boolean notificationsEnabled;
    private Boolean onboardingCompleted;

    // ─── Tracking ────────────────────────────────────────────────
    private Integer articlesRead;
    private Integer totalShares;
    private Integer totalComments;
    private Integer profileViews;
    private Integer profileLikes;
    private List<Long> likedUserIds;
    private String currentFrame;
    private List<String> badges;
    private String city;
    private String state;
    private String country;

    // ✅ This is what ContentService reads to fetch saved articles
    private List<Long> savedArticleIds;

    private List<Long> savedMemeIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> pendingBadges;

}