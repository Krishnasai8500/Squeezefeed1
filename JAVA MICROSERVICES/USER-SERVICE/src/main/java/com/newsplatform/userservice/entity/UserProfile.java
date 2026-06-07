package com.newsplatform.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long authUserId;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String userName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String language;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_preferred_categories",
            joinColumns = @JoinColumn(name = "user_profile_id")
    )
    @Column(name = "category")
    private List<String> preferredCategories;

    @Column(nullable = false)
    private String subscriptionPlan;

    @Builder.Default
    @Column(nullable = false)
    private Boolean notificationsEnabled = false;

    // ─── Tracking Fields ────────────────────────────────────────

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private Integer articlesRead = 0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalShares = 0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private Integer profileViews = 0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private Integer profileLikes = 0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalComments = 0;

    // Current profile frame
    @Column(columnDefinition = "varchar(255) default 'default'")
    @Builder.Default
    private String currentFrame = "default";

    // Badges earned
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_badges",
            joinColumns = @JoinColumn(name = "user_profile_id")
    )
    @Column(name = "badge")
    @Builder.Default
    private List<String> badges = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_pending_badges",
            joinColumns = @JoinColumn(name = "user_profile_id")
    )
    @Column(name = "badge")
    @Builder.Default
    private List<String> pendingBadges = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_saved_articles",
            joinColumns = @JoinColumn(name = "user_profile_id")
    )
    @Column(name = "content_id")
    @Builder.Default
    private List<Long> savedArticleIds = new ArrayList<>();


    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_saved_memes",
            joinColumns = @JoinColumn(name = "user_profile_id")
    )
    @Column(name = "meme_id")
    @Builder.Default
    private List<Long> savedMemeIds = new ArrayList<>();


    // ─── Timestamps ─────────────────────────────────────────────

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();

        updatedAt = LocalDateTime.now();

        if (likedUserIds == null)
            likedUserIds = new ArrayList<>();
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "profile_liked_users",
            joinColumns = @JoinColumn(
                    name = "profile_id"
            )
    )
    @Column(name = "liked_user_id")
    private List<Long> likedUserIds;
    @ElementCollection
    private Set<Long> profileViewedBy = new HashSet<>();

    private String city;

    private String state;

    private String country;

    @Builder.Default
    @Column(nullable = false)
    private Boolean onboardingCompleted = false;
}