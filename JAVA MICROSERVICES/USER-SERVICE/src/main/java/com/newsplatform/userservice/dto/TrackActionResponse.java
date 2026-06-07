package com.newsplatform.userservice.dto;

import lombok.*;

import java.util.List;

/**
 * Returned to frontend after every track call.
 * Frontend uses this to show badge popups and update vibe display.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackActionResponse {

    private Integer articlesRead;
    private Integer totalShares;
    private Integer totalComments;
    private String currentFrame;
    private List<String> badges;

    // Newly earned badges in this action — frontend shows popup for these
    private List<String> newlyEarnedBadges;

    // Whether frame changed in this action
    private boolean frameUpgraded;
}