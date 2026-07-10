package com.newsplatform.userservice.controller;

import com.newsplatform.userservice.dto.*;
import com.newsplatform.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.newsplatform.userservice.service.BadgeCatalog;

import java.util.List;
import java.util.*;
import com.newsplatform.userservice.dto.CreateFeedbackRequest;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PostMapping("/profile")
    public ResponseEntity<UserProfileResponse> createUserProfile(
            @Valid @RequestBody CreateUserProfileRequest request
    ) {
        return ResponseEntity.ok(
                userProfileService.createUserProfile(request)
        );
    }

    @GetMapping("/profile/{authUserId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable Long authUserId
    ) {
        return ResponseEntity.ok(
                userProfileService.getUserProfileByAuthUserId(authUserId)
        );
    }

    @PutMapping("/profile/{authUserId}")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable Long authUserId,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        return ResponseEntity.ok(
                userProfileService.updateUserProfile(authUserId, request)
        );
    }

    // ─── Tracking Endpoints ──────────────────────────────────────────────────────

    /**
     * Called from frontend after user spends 5+ seconds on an article.
     * POST /api/users/track/read/{authUserId}
     */
    @PostMapping("/track/read/{authUserId}")
    public ResponseEntity<TrackActionResponse> trackRead(
            @PathVariable Long authUserId
    ) {
        return ResponseEntity.ok(
                userProfileService.trackRead(authUserId)
        );
    }

    @PostMapping("/track/impression/{authUserId}")
    public ResponseEntity<Void> trackImpression(
            @PathVariable Long authUserId,
            @RequestBody Map<String, Object> body
    ) {

        Long contentId =
                Long.valueOf(
                        body.get("contentId").toString()
                );

        userProfileService.trackImpression(
                authUserId,
                contentId
        );

        return ResponseEntity.ok().build();
    }

    /**
     * Called from frontend when user clicks share on an article.
     * POST /api/users/track/share/{authUserId}
     */
    @PostMapping("/track/share/{authUserId}")
    public ResponseEntity<TrackActionResponse> trackShare(
            @PathVariable Long authUserId
    ) {
        return ResponseEntity.ok(
                userProfileService.trackShare(authUserId)
        );
    }

    /**
     * Called from frontend when user posts a comment.
     * POST /api/users/track/comment/{authUserId}
     */
    @PostMapping("/track/comment/{authUserId}")
    public ResponseEntity<TrackActionResponse> trackComment(
            @PathVariable Long authUserId
    ) {
        return ResponseEntity.ok(
                userProfileService.trackComment(authUserId)
        );
    }

    @PostMapping("/save/{authUserId}/{contentId}")
    public ResponseEntity<TrackActionResponse> saveArticle(
            @PathVariable Long authUserId,
            @PathVariable Long contentId
    ) {

        return ResponseEntity.ok(
                userProfileService.saveArticle(
                        authUserId,
                        contentId
                )
        );
    }

    @DeleteMapping("/save/{authUserId}/{contentId}")
    public ResponseEntity<TrackActionResponse> unsaveArticle(
            @PathVariable Long authUserId,
            @PathVariable Long contentId
    ) {

        return ResponseEntity.ok(
                userProfileService.unsaveArticle(
                        authUserId,
                        contentId
                )
        );
    }


    @PostMapping("/save-meme/{authUserId}/{memeId}")
    public ResponseEntity<TrackActionResponse> saveMeme(
            @PathVariable Long authUserId,
            @PathVariable Long memeId
    ) {

        return ResponseEntity.ok(
                userProfileService.saveMeme(
                        authUserId,
                        memeId
                )
        );
    }

    @DeleteMapping("/save-meme/{authUserId}/{memeId}")
    public ResponseEntity<TrackActionResponse> unsaveMeme(
            @PathVariable Long authUserId,
            @PathVariable Long memeId
    ) {

        return ResponseEntity.ok(
                userProfileService.unsaveMeme(
                        authUserId,
                        memeId
                )
        );
    }


    @GetMapping("/saved/{authUserId}")
    public ResponseEntity<UserProfileResponse> getSavedArticles(
            @PathVariable Long authUserId
    ) {

        return ResponseEntity.ok(
                userProfileService.getUserProfileByAuthUserId(
                        authUserId
                )
        );
    }

    @PostMapping("/track/profile-view/{profileOwnerId}/{viewerUserId}")
    public ResponseEntity<TrackActionResponse> trackProfileView(

            @PathVariable Long profileOwnerId,
            @PathVariable Long viewerUserId
    ) {

        return ResponseEntity.ok(

                userProfileService.trackProfileView(
                        profileOwnerId,
                        viewerUserId
                )
        );
    }

    @PostMapping("/track/profile-like/{authUserId}")
    public ResponseEntity<TrackActionResponse> trackProfileLike(
            @PathVariable Long authUserId
    ) {

        return ResponseEntity.ok(
                userProfileService.trackProfileLike(
                        authUserId
                )
        );
    }

    @GetMapping("/badges")
    public ResponseEntity<List<BadgeCatalog.BadgeInfo>> getAllBadges() {

        return ResponseEntity.ok(
                BadgeCatalog.BADGES
        );
    }

    @PutMapping("/claim-badge/{authUserId}/{badgeKey}")
    public ResponseEntity<UserProfileResponse> claimBadge(
            @PathVariable Long authUserId,
            @PathVariable String badgeKey
    ) {

        return ResponseEntity.ok(
                userProfileService.claimBadge(
                        authUserId,
                        badgeKey
                )
        );
    }

    @GetMapping("/profile/username/{userName}")
    public ResponseEntity<UserProfileResponse>
    getUserProfileByUserName(
            @PathVariable String userName
    ) {

        return ResponseEntity.ok(
                userProfileService
                        .getUserProfileByUserName(
                                userName
                        )
        );
    }

    @PostMapping(
            "/profile-like/{profileOwnerId}/{likerUserId}"
    )
    public ResponseEntity<TrackActionResponse>
    likePublicProfile(
            @PathVariable Long profileOwnerId,
            @PathVariable Long likerUserId
    ) {

        return ResponseEntity.ok(
                userProfileService
                        .likePublicProfile(
                                profileOwnerId,
                                likerUserId
                        )
        );
    }

    @GetMapping("/search")
    public ResponseEntity<
            List<UserProfileResponse>
            > searchProfiles(
            @RequestParam String query
    ) {

        return ResponseEntity.ok(
                userProfileService
                        .searchProfiles(query)
        );
    }

    @PostMapping("/location")
    public ResponseEntity<?> updateLocation(

            @RequestBody UpdateUserProfileRequest request
    ) {

        userProfileService.updateLocation(request);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/track/click/{authUserId}")
    public ResponseEntity<Void> trackClick(
            @PathVariable Long authUserId,
            @RequestBody Map<String, Object> body
    ) {

        Long contentId =
                Long.valueOf(
                        body.get("contentId").toString()
                );

        userProfileService.trackClick(
                authUserId,
                contentId
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/track/session/{authUserId}")
    public ResponseEntity<Void> trackSession(
            @PathVariable Long authUserId,
            @RequestBody Map<String, Object> body
    ) {

        Long durationSeconds =
                Long.valueOf(
                        body.get("durationSeconds").toString()
                );

        userProfileService.trackSession(
                authUserId,
                durationSeconds
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/track/device/{authUserId}")
    public ResponseEntity<Void> trackDevice(
            @PathVariable Long authUserId,
            @RequestBody Map<String, Object> body
    ) {

        userProfileService.trackDevice(
                authUserId,
                body
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/track/referral")
    public ResponseEntity<Void> trackReferral(
            @RequestBody Map<String, Object> body
    ) {

        userProfileService.trackReferral(body);

        return ResponseEntity.ok().build();
    }

    @GetMapping(
            "/preferences/category/{category}"
    )
    public ResponseEntity<List<Long>>
    getUsersByCategory(
            @PathVariable String category
    ) {

        return ResponseEntity.ok(
                userProfileService
                        .getUsersByCategory(category)
        );
    }

    @GetMapping("/language/{authUserId}")
    public ResponseEntity<String> getUserLanguage(
            @PathVariable Long authUserId
    ) {

        return ResponseEntity.ok(
                userProfileService.getUserLanguage(
                        authUserId
                )
        );
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(
            @RequestBody CreateFeedbackRequest request
    ) {

        userProfileService.submitFeedback(
                request
        );

        return ResponseEntity.ok(
                "Feedback submitted successfully"
        );
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        return ResponseEntity.ok(
                userProfileService.getAllFeedback()
        );
    }

}