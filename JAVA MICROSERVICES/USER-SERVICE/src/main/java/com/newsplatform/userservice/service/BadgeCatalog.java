package com.newsplatform.userservice.service;

import lombok.*;

import java.util.List;

public class BadgeCatalog {

    public static final List<BadgeInfo> BADGES = List.of(

            new BadgeInfo(
                    "NEWS_HUNTER_I",
                    "News Hunter I",
                    "Read 100 articles",
                    false
            ),

            new BadgeInfo(
                    "NEWS_HUNTER_II",
                    "News Hunter II",
                    "Read 500 articles",
                    true
            ),

            new BadgeInfo(
                    "NEWS_HUNTER_III",
                    "News Hunter III",
                    "Read 1500 articles",
                    true
            ),

            new BadgeInfo(
                    "SIGNAL_BOOSTER_I",
                    "Signal Booster I",
                    "Share 10 articles",
                    false
            ),

            new BadgeInfo(
                    "DEBATE_LORD_I",
                    "Debate Lord I",
                    "Post 25 comments",
                    false
            ),

            new BadgeInfo(
                    "KNOWN_FACE_I",
                    "Known Face I",
                    "Get 200 profile visits",
                    false
            ),

            new BadgeInfo(
                    "MOST_LIKED_I",
                    "Most Liked I",
                    "Receive 25 profile likes",
                    false
            ),

            new BadgeInfo(
                    "OVERACHIEVER",
                    "Overachiever",
                    "Unlock all major badge paths",
                    true
            )
    );

    @Getter
    @Setter
    @AllArgsConstructor
    public static class BadgeInfo {

        private String key;

        private String title;

        private String description;

        private boolean lockedInitially;
    }
}