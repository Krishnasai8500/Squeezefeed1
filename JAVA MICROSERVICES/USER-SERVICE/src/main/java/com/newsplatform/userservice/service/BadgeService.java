package com.newsplatform.userservice.service;

import com.newsplatform.userservice.entity.UserProfile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BadgeService {

    // ─── Read Milestones ────────────────────────────────────────
    private static final int READ_TIER_1 = 100;
    private static final int READ_TIER_2 = 500;
    private static final int READ_TIER_3 = 1500;

    // ─── Share Milestones ───────────────────────────────────────
    private static final int SHARE_TIER_1 = 10;
    private static final int SHARE_TIER_2 = 50;
    private static final int SHARE_TIER_3 = 200;

    // ─── Comment Milestones ─────────────────────────────────────
    private static final int COMMENT_TIER_1 = 25;
    private static final int COMMENT_TIER_2 = 100;
    private static final int COMMENT_TIER_3 = 300;

    // ─── Profile View Milestones ────────────────────────────────
    private static final int VIEW_TIER_1 = 200;
    private static final int VIEW_TIER_2 = 1000;
    private static final int VIEW_TIER_3 = 5000;

    // ─── Profile Like Milestones ────────────────────────────────
    private static final int LIKE_TIER_1 = 25;
    private static final int LIKE_TIER_2 = 150;
    private static final int LIKE_TIER_3 = 600;

    // ─── Frame Milestones ───────────────────────────────────────
    private static final int FRAME_BLUE   = 50;
    private static final int FRAME_ORANGE = 200;
    private static final int FRAME_FIRE   = 500;
    private static final int FRAME_GALAXY = 1500;

    // ─── Read Badges ────────────────────────────────────────────
    public List<String> evaluateReadBadges(
            UserProfile profile
    ) {
        return evaluateTieredBadge(
                profile,
                profile.getArticlesRead(),
                READ_TIER_1,
                READ_TIER_2,
                READ_TIER_3,
                "NEWS_HUNTER"
        );
    }

    // ─── Share Badges ───────────────────────────────────────────
    public List<String> evaluateShareBadges(
            UserProfile profile
    ) {
        return evaluateTieredBadge(
                profile,
                profile.getTotalShares(),
                SHARE_TIER_1,
                SHARE_TIER_2,
                SHARE_TIER_3,
                "SIGNAL_BOOSTER"
        );
    }

    // ─── Comment Badges ─────────────────────────────────────────
    public List<String> evaluateCommentBadges(
            UserProfile profile
    ) {
        return evaluateTieredBadge(
                profile,
                profile.getTotalComments(),
                COMMENT_TIER_1,
                COMMENT_TIER_2,
                COMMENT_TIER_3,
                "DEBATE_LORD"
        );
    }

    // ─── Profile View Badges ────────────────────────────────────
    public List<String> evaluateProfileViewBadges(
            UserProfile profile
    ) {
        return evaluateTieredBadge(
                profile,
                profile.getProfileViews(),
                VIEW_TIER_1,
                VIEW_TIER_2,
                VIEW_TIER_3,
                "KNOWN_FACE"
        );
    }

    // ─── Profile Like Badges ────────────────────────────────────
    public List<String> evaluateProfileLikeBadges(
            UserProfile profile
    ) {
        return evaluateTieredBadge(
                profile,
                profile.getProfileLikes(),
                LIKE_TIER_1,
                LIKE_TIER_2,
                LIKE_TIER_3,
                "MOST_LIKED"
        );
    }

    // ─── Overachiever Badge ─────────────────────────────────────
    public List<String> evaluateUltimateBadges(
            UserProfile profile
    ) {

        List<String> earned = new ArrayList<>();

        List<String> badges = profile.getBadges();

        boolean hasRead =
                badges.contains("NEWS_HUNTER_III");

        boolean hasShare =
                badges.contains("SIGNAL_BOOSTER_III");

        boolean hasComment =
                badges.contains("DEBATE_LORD_III");

        boolean hasView =
                badges.contains("KNOWN_FACE_III");

        boolean hasLike =
                badges.contains("MOST_LIKED_III");

        if (
                hasRead &&
                        hasShare &&
                        hasComment &&
                        hasView &&
                        hasLike &&
                        !badges.contains("OVERACHIEVER")
        ) {

            badges.add("OVERACHIEVER");

            earned.add("OVERACHIEVER");
        }

        return earned;
    }

    // ─── Frame Progression ──────────────────────────────────────
    public boolean evaluateFrame(
            UserProfile profile
    ) {

        String newFrame =
                resolveFrame(profile.getArticlesRead());

        if (
                !newFrame.equals(
                        profile.getCurrentFrame()
                )
        ) {

            profile.setCurrentFrame(newFrame);

            return true;
        }

        return false;
    }

    // ─── Internal Tier Logic ────────────────────────────────────
    private List<String> evaluateTieredBadge(
            UserProfile profile,
            int count,
            int tier1,
            int tier2,
            int tier3,
            String badgePrefix
    ) {

        List<String> newlyEarned =
                new ArrayList<>();

        List<String> badges =
                profile.getBadges();

        List<String> pending =
                profile.getPendingBadges();

        String badgeI =
                badgePrefix + "_I";

        String badgeII =
                badgePrefix + "_II";

        String badgeIII =
                badgePrefix + "_III";

        // Tier I
        if (
                count >= tier1 &&
                        !badges.contains(badgeI) &&
                        !pending.contains(badgeI)
        ) {

            pending.add(badgeI);

            newlyEarned.add(badgeI);
        }

        // Tier II
        if (
                count >= tier2 &&
                        !badges.contains(badgeII) &&
                        !pending.contains(badgeII)
        ) {

            pending.add(badgeII);

            newlyEarned.add(badgeII);
        }

        // Tier III
        if (
                count >= tier3 &&
                        !badges.contains(badgeIII) &&
                        !pending.contains(badgeIII)
        ) {

            pending.add(badgeIII);

            newlyEarned.add(badgeIII);
        }

        return newlyEarned;
    }
    private String resolveFrame(
            int articlesRead
    ) {

        if (articlesRead >= FRAME_GALAXY)
            return "galaxy";

        if (articlesRead >= FRAME_FIRE)
            return "fire";

        if (articlesRead >= FRAME_ORANGE)
            return "orange_pulse";

        if (articlesRead >= FRAME_BLUE)
            return "blue_glow";

        return "default";
    }
}