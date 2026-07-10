package com.newsplatform.userservice.service.impl;

import com.newsplatform.userservice.dto.*;
import com.newsplatform.userservice.entity.UserProfile;
import com.newsplatform.userservice.repository.UserProfileRepository;
import com.newsplatform.userservice.service.BadgeService;
import com.newsplatform.userservice.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import java.util.ArrayList;
import java.util.List;

 import org.springframework.web.client.RestTemplate;
 import org.springframework.http.HttpEntity;
 import org.springframework.http.HttpHeaders;
 import org.springframework.http.MediaType;

import com.newsplatform.userservice.entity.Feedback;
import com.newsplatform.userservice.repository.FeedbackRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final BadgeService badgeService;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final FeedbackRepository feedbackRepository;

    @Override
    public UserProfileResponse createUserProfile(CreateUserProfileRequest request) {

        if (userProfileRepository.existsByAuthUserId(request.getAuthUserId())) {
            throw new RuntimeException("User profile already exists");
        }

        UserProfile userProfile = UserProfile.builder()
                .authUserId(request.getAuthUserId())
                .fullName(request.getFullName())
                .userName(request.getUserName())
                .email(request.getEmail())
                .role(request.getRole())
                .language(request.getLanguage())
                .preferredCategories(request.getPreferredCategories())
                .subscriptionPlan(request.getSubscriptionPlan())
                .notificationsEnabled(request.getNotificationsEnabled())
                .build();

        UserProfile saved = userProfileRepository.save(userProfile);
        publishEvent("user.registered", Map.of(
                "userId",    saved.getAuthUserId(),
                "createdAt", LocalDateTime.now().toString()
        ));
        return mapToResponse(saved);
    }

    @Override
    public UserProfileResponse getUserProfileByAuthUserId(Long authUserId) {

        UserProfile userProfile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        return mapToResponse(userProfile);
    }

    @Override
    public UserProfileResponse updateUserProfile(
            Long authUserId,
            UpdateUserProfileRequest request
    ) {

        UserProfile userProfile = userProfileRepository
                .findByAuthUserId(authUserId)
                .orElseThrow(() ->
                        new RuntimeException("User profile not found"));

        // Optional fields
        if (request.getUserName() != null) {
            userProfile.setUserName(request.getUserName());
        }

        if (request.getFullName() != null) {
            userProfile.setFullName(request.getFullName());
        }

        if (request.getCity() != null) {
            userProfile.setCity(request.getCity());
        }

        if (request.getState() != null) {
            userProfile.setState(request.getState());
        }

        if (request.getCountry() != null) {
            userProfile.setCountry(request.getCountry());
        }

        // Onboarding fields
        userProfile.setLanguage(request.getLanguage());
        userProfile.setPreferredCategories(

                new ArrayList<>(

                        request.getPreferredCategories()
                                .stream()
                                .distinct()
                                .toList()
                )
        );
        userProfile.setSubscriptionPlan(
                request.getSubscriptionPlan()
        );
        userProfile.setNotificationsEnabled(
                request.getNotificationsEnabled()
        );
        if (request.getOnboardingCompleted() != null) {
            userProfile.setOnboardingCompleted(request.getOnboardingCompleted());
        }

        return mapToResponse(
                userProfileRepository.save(userProfile)
        );
    }

    // ─── Tracking ────────────────────────────────────────────────────────────────

    @Override
    public TrackActionResponse trackRead(Long authUserId) {

        UserProfile profile = findProfile(authUserId);
        profile.setArticlesRead(profile.getArticlesRead() + 1);

        List<String> newBadges = badgeService.evaluateReadBadges(profile);
        boolean frameUpgraded = badgeService.evaluateFrame(profile);

        userProfileRepository.save(profile);
        // ── ADD after save in trackRead ──────────────────────
        if (!newBadges.isEmpty()) {
            for (String badge : newBadges) {
                createBadgeNotification(profile.getAuthUserId(), badge);
            }
        }
// ────────────────────────────────────────────────────

        publishEvent("user.article.read", Map.of(
                "userId",    authUserId,
                "createdAt", LocalDateTime.now().toString()
        ));

        return buildTrackResponse(profile, newBadges, frameUpgraded);
    }

    @Override
    public TrackActionResponse trackShare(Long authUserId) {

        UserProfile profile = findProfile(authUserId);
        profile.setTotalShares(profile.getTotalShares() + 1);

        List<String> newBadges = badgeService.evaluateShareBadges(profile);

        userProfileRepository.save(profile);
        // ── ADD after save in trackRead ──────────────────────
        if (!newBadges.isEmpty()) {
            for (String badge : newBadges) {
                createBadgeNotification(profile.getAuthUserId(), badge);
            }
        }
// ────────────────────────────────────────────────────

        publishEvent("user.article.shared", Map.of(
                "userId",    authUserId,
                "createdAt", LocalDateTime.now().toString()
        ));

        return buildTrackResponse(profile, newBadges, false);
    }

    @Override
    public TrackActionResponse trackComment(Long authUserId) {

        UserProfile profile = findProfile(authUserId);
        profile.setTotalComments(profile.getTotalComments() + 1);

        List<String> newBadges = badgeService.evaluateCommentBadges(profile);

        userProfileRepository.save(profile);
        // ── ADD after save in trackRead ──────────────────────
        if (!newBadges.isEmpty()) {
            for (String badge : newBadges) {
                createBadgeNotification(profile.getAuthUserId(), badge);
            }
        }
// ────────────────────────────────────────────────────

        return buildTrackResponse(profile, newBadges, false);
    }

    @Override
    public TrackActionResponse trackProfileView(
            Long profileOwnerId,
            Long viewerUserId
    ) {

        UserProfile profile = findProfile(profileOwnerId);

        // Prevent self views
        if (viewerUserId.equals(profileOwnerId)) {

            return buildTrackResponse(
                    profile,
                    List.of(),
                    false
            );
        }

        // Unique views only
        if (!profile.getProfileViewedBy().contains(viewerUserId)) {

            profile.getProfileViewedBy().add(viewerUserId);

            profile.setProfileViews(
                    profile.getProfileViews() + 1
            );

            userProfileRepository.save(profile);
        }

        return buildTrackResponse(profile, List.of(), false);
    }

    @Override
    public TrackActionResponse trackProfileLike(Long authUserId) {

        UserProfile profile = findProfile(authUserId);
        profile.setProfileLikes(profile.getProfileLikes() + 1);

        userProfileRepository.save(profile);

        return buildTrackResponse(profile, List.of(), false);
    }

    @Override
    public UserProfileResponse claimBadge(
            Long authUserId,
            String badgeKey
    ) {

        UserProfile profile =
                userProfileRepository.findByAuthUserId(authUserId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User profile not found"
                                )
                        );

        if (
                profile.getPendingBadges() != null &&
                        profile.getPendingBadges().contains(badgeKey)
        ) {

            profile.getPendingBadges()
                    .remove(badgeKey);

            if (
                    profile.getBadges() == null
            ) {
                profile.setBadges(
                        new ArrayList<>()
                );
            }

            if (
                    !profile.getBadges().contains(badgeKey)
            ) {
                profile.getBadges()
                        .add(badgeKey);
            }
        }

        userProfileRepository.save(profile);

        return mapToResponse(profile);
    }

    // ─── Save / Unsave ───────────────────────────────────────────────────────────

    @Override
    public TrackActionResponse saveArticle(Long authUserId, Long contentId) {

        UserProfile profile = findProfile(authUserId);

        if (!profile.getSavedArticleIds().contains(contentId)) {
            profile.getSavedArticleIds().add(contentId);
            userProfileRepository.save(profile);
        }

        return buildTrackResponse(profile, List.of(), false);
    }

    @Override
    public TrackActionResponse unsaveArticle(Long authUserId, Long contentId) {

        UserProfile profile = findProfile(authUserId);

        profile.getSavedArticleIds().remove(contentId);
        userProfileRepository.save(profile);

        return buildTrackResponse(profile, List.of(), false);
    }

    @Override
    public TrackActionResponse saveMeme(
            Long authUserId,
            Long memeId
    ) {

        UserProfile profile = findProfile(authUserId);

        if (!profile.getSavedMemeIds().contains(memeId)) {

            profile.getSavedMemeIds().add(memeId);

            userProfileRepository.save(profile);
        }

        return buildTrackResponse(
                profile,
                List.of(),
                false
        );
    }

    @Override
    public TrackActionResponse unsaveMeme(
            Long authUserId,
            Long memeId
    ) {

        UserProfile profile = findProfile(authUserId);

        profile.getSavedMemeIds().remove(memeId);

        userProfileRepository.save(profile);

        return buildTrackResponse(
                profile,
                List.of(),
                false
        );
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private UserProfile findProfile(Long authUserId) {

        UserProfile profile =
                userProfileRepository
                        .findByAuthUserId(authUserId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User profile not found"
                                )
                        );

        if (profile.getBadges() == null)
            profile.setBadges(new ArrayList<>());

        if (profile.getSavedArticleIds() == null)
            profile.setSavedArticleIds(new ArrayList<>());

        if (profile.getSavedMemeIds() == null)
            profile.setSavedMemeIds(new ArrayList<>());

        return profile;
    }

    private TrackActionResponse buildTrackResponse(
            UserProfile profile,
            List<String> newBadges,
            boolean frameUpgraded
    ) {
        return TrackActionResponse.builder()
                .articlesRead(profile.getArticlesRead())
                .totalShares(profile.getTotalShares())
                .totalComments(profile.getTotalComments())
                .currentFrame(profile.getCurrentFrame())
                .badges(profile.getBadges())
                .newlyEarnedBadges(newBadges)
                .frameUpgraded(frameUpgraded)
                .build();
    }

    // ✅ Key fix — savedArticleIds now included in every response
    private UserProfileResponse mapToResponse(UserProfile userProfile) {
        return UserProfileResponse.builder()
                .id(userProfile.getId())
                .authUserId(userProfile.getAuthUserId())
                .fullName(userProfile.getFullName())
                .userName(userProfile.getUserName())
                .email(userProfile.getEmail())
                .role(userProfile.getRole())
                .language(userProfile.getLanguage())
                .preferredCategories(userProfile.getPreferredCategories())
                .subscriptionPlan(userProfile.getSubscriptionPlan())
                .notificationsEnabled(userProfile.getNotificationsEnabled())
                .onboardingCompleted(userProfile.getOnboardingCompleted())
                .articlesRead(userProfile.getArticlesRead())
                .totalShares(userProfile.getTotalShares())
                .totalComments(userProfile.getTotalComments())
                .profileViews(userProfile.getProfileViews())
                .profileLikes(userProfile.getProfileLikes())
                .likedUserIds(

                        userProfile.getLikedUserIds() != null
                                ? userProfile.getLikedUserIds()
                                : new ArrayList<>()
                )
                .currentFrame(userProfile.getCurrentFrame())
                .badges(userProfile.getBadges())
                .savedArticleIds(userProfile.getSavedArticleIds()) // ✅ was missing
                .savedMemeIds(userProfile.getSavedMemeIds())
                .pendingBadges(userProfile.getPendingBadges())
                .createdAt(userProfile.getCreatedAt())
                .updatedAt(userProfile.getUpdatedAt())
                .city(userProfile.getCity())
                .state(userProfile.getState())
                .country(userProfile.getCountry())
                .build();
    }

    @Override
    public UserProfileResponse
    getUserProfileByUserName(
            String userName
    ) {

        UserProfile userProfile =
                userProfileRepository
                        .findByUserName(userName)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        return mapToResponse(userProfile);
    }

    @Override
    public TrackActionResponse likePublicProfile(
            Long profileOwnerId,
            Long likerUserId
    ) {

        if (
                profileOwnerId.equals(
                        likerUserId
                )
        ) {

            throw new RuntimeException(
                    "Cannot like own profile"
            );
        }

        UserProfile profile =
                userProfileRepository
                        .findByAuthUserId(
                                profileOwnerId
                        )
                        .orElseThrow();

        if (profile.getLikedUserIds() == null) {

            profile.setLikedUserIds(
                    new ArrayList<>()
            );
        }

        if (
                profile.getLikedUserIds()
                        .contains(likerUserId)
        ) {

            throw new RuntimeException(
                    "Already liked"
            );
        }

        profile.getLikedUserIds()
                .add(likerUserId);

        profile.setProfileLikes(
                profile.getProfileLikes() + 1
        );

        userProfileRepository.save(profile);

        return TrackActionResponse
                .builder()
                .build();
    }

    @Override
    public List<UserProfileResponse> searchProfiles(String query) {

        publishEvent("user.search", Map.of(
                "query", query,
                "createdAt", LocalDateTime.now().toString()
        ));

        return userProfileRepository
                .findByUserNameContainingIgnoreCase(query)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void updateLocation(
            UpdateUserProfileRequest request
    ) {

        UserProfile profile =
                findProfile(
                        request.getAuthUserId()
                );

        profile.setCity(request.getCity());

        profile.setState(request.getState());

        profile.setCountry(request.getCountry());

        userProfileRepository.save(profile);
    }

    // ─── Kafka Publisher ─────────────────────────────────────────────────────────

    private void publishEvent(String topic, Map<String, Object> payload) {
        try {
            kafkaTemplate.send(topic, objectMapper.writeValueAsString(payload));
            log.info("Published event to topic: {}", topic);
        } catch (Exception e) {
            log.error("Failed to publish event to {}: {}", topic, e.getMessage());
        }
    }

    @Override
    public void trackImpression(
            Long authUserId,
            Long contentId
    ) {

        publishEvent(
                "user.article.impression",
                Map.of(
                        "userId", authUserId,
                        "contentId", contentId,
                        "createdAt",
                        LocalDateTime.now().toString()
                )
        );
    }

    @Override
    public void trackClick(
            Long authUserId,
            Long contentId
    ) {

        publishEvent(
                "user.article.clicked",
                Map.of(
                        "userId", authUserId,
                        "contentId", contentId,
                        "createdAt",
                        LocalDateTime.now().toString()
                )
        );
    }

    @Override
    public void trackSession(
            Long authUserId,
            Long durationSeconds
    ) {

        publishEvent(
                "user.session.duration",
                Map.of(
                        "userId", authUserId,
                        "durationSeconds", durationSeconds,
                        "createdAt",
                        LocalDateTime.now().toString()
                )
        );
    }

    @Override
    public void trackDevice(
            Long authUserId,
            Map<String, Object> deviceInfo
    ) {

        Map<String, Object> event =
                new HashMap<>(deviceInfo);

        event.put("userId", authUserId);
        event.put(
                "createdAt",
                LocalDateTime.now().toString()
        );

        publishEvent(
                "user.device",
                event
        );
    }

    @Override
    public void trackReferral(
            Map<String, Object> referralData
    ) {

        publishEvent(
                "user.referral",
                referralData
        );
    }


    private void createBadgeNotification(Long userId, String badgeKey) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("userId",          userId);
            body.put("title",           "🏆 New Badge Unlocked!");
            body.put("message",         "You earned the " + badgeKey.replace("_", " ") + " badge! Visit your profile to claim it.");
            body.put("type",            "BADGE");
            body.put("deliveryChannel", "IN_APP");
            body.put("status",          "SENT");
            body.put("isRead",          false);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
//              localrun
//            restTemplate.postForObject(
//                    "http://localhost:8087/api/notifications", // ← your notification service port
//                    request,
//                    Object.class
//            );

            restTemplate.postForObject(
                    "http://notification-service:8087/api/notifications", // ← your notification service port
                    request,
                    Object.class
            );
        } catch (Exception e) {
            log.error("Failed to create badge notification: {}", e.getMessage());
        }
    }

    public List<Long> getUsersByCategory(
            String category
    ) {

        return userProfileRepository
                .findUsersByCategory(category)
                .stream()
                .map(UserProfile::getAuthUserId)
                .toList();
    }

    @Override
    public String getUserLanguage(
            Long authUserId
    ) {

        UserProfile profile =
                userProfileRepository
                        .findByAuthUserId(authUserId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        return profile.getLanguage();
    }

    @Override
    public void submitFeedback(
            CreateFeedbackRequest request
    ) {

        UserProfile profile =
                findProfile(
                        request.getAuthUserId()
                );

        Feedback feedback =
                Feedback.builder()
                        .authUserId(
                                profile.getAuthUserId()
                        )
                        .userName(
                                profile.getUserName()
                        )
                        .email(
                                profile.getEmail()
                        )
                        .category(
                                request.getCategory()
                        )
                        .message(
                                request.getMessage()
                        )
                        .build();

        feedbackRepository.save(
                feedback
        );
    }

    @Override
    public List<FeedbackResponse> getAllFeedback() {

        return feedbackRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}