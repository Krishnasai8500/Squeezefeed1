package com.newsplatform.userservice.service;

import com.newsplatform.userservice.dto.*;

import java.util.*;
import com.newsplatform.userservice.dto.*;
public interface UserProfileService {

    UserProfileResponse createUserProfile(CreateUserProfileRequest request);

    UserProfileResponse getUserProfileByAuthUserId(Long authUserId);

    UserProfileResponse updateUserProfile(Long authUserId, UpdateUserProfileRequest request);

    // ─── Tracking ────────────────────────────────────────────────────────────────

    TrackActionResponse trackRead(TrackReadRequest request);

    TrackActionResponse trackShare(Long authUserId);

    TrackActionResponse trackComment(Long authUserId);

    TrackActionResponse saveArticle(
            Long authUserId,
            Long contentId
    );

    TrackActionResponse unsaveArticle(
            Long authUserId,
            Long contentId
    );

    TrackActionResponse saveMeme(
            Long authUserId,
            Long memeId
    );

    TrackActionResponse unsaveMeme(
            Long authUserId,
            Long memeId
    );

    TrackActionResponse trackProfileView(
            Long profileOwnerId,
            Long viewerUserId
    );

    TrackActionResponse trackProfileLike(
            Long authUserId
    );

    UserProfileResponse claimBadge(
            Long authUserId,
            String badgeKey
    );

    UserProfileResponse
    getUserProfileByUserName(
            String userName
    );

    TrackActionResponse likePublicProfile(
            Long profileOwnerId,
            Long likerUserId
    );

    List<UserProfileResponse>
    searchProfiles(
            String query
    );

    void updateLocation(
            UpdateUserProfileRequest request
    );

    void trackImpression(
            Long authUserId,
            Long contentId
    );

    void trackClick(
            Long authUserId,
            Long contentId
    );

    void trackSession(
            Long authUserId,
            Long durationSeconds
    );

    void trackDevice(
            Long authUserId,
            Map<String, Object> deviceInfo
    );

    void trackReferral(
            Map<String, Object> referralData
    );
    List<Long> getUsersByCategory(
            String category
    );

    String getUserLanguage(Long authUserId);

    void submitFeedback(
            CreateFeedbackRequest request
    );

    List<FeedbackResponse> getAllFeedback();
}