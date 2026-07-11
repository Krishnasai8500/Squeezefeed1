// KafkaAnalyticsConsumer.java
package com.newsplatform.analyticsservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.analyticsservice.entity.AnalyticsType;
import com.newsplatform.analyticsservice.entity.ContentAnalytics;
import com.newsplatform.analyticsservice.repository.ContentAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaAnalyticsConsumer {

    private final ContentAnalyticsRepository repository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "user.article.read", groupId = "analytics-group")
    public void onRead(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            save(payload, AnalyticsType.VIEW);
        } catch (Exception e) {
            log.error("Failed to process read event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "user.article.shared", groupId = "analytics-group")
    public void onShare(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            save(payload, AnalyticsType.SHARE);
        } catch (Exception e) {
            log.error("Failed to process share event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "user.article.commented", groupId = "analytics-group")
    public void onComment(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            save(payload, AnalyticsType.COMMENT); // reuse CLICK for comments
        } catch (Exception e) {
            log.error("Failed to process comment event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "user.registered", groupId = "analytics-group")
    public void onUserRegistered(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            Long userId = Long.valueOf(payload.get("userId").toString());

            // ✅ Prevent duplicate
            boolean exists = repository.existsBySourceAndUserId("REGISTRATION", userId);
            if (exists) {
                log.warn("Duplicate REGISTRATION event for userId {}, skipping", userId);
                return;
            }

            ContentAnalytics analytics = ContentAnalytics.builder()
                    .userId(userId)
                    .analyticsType(AnalyticsType.REGISTRATION)
                    .source("REGISTRATION")
                    .metricValue(1)
                    .build();
            repository.save(analytics);
        } catch (Exception e) {
            log.error("Failed to process registration event: {}", e.getMessage());
        }
    }



    @KafkaListener(topics = "user.search", groupId = "analytics-group")
    public void onSearch(String message) {
        try {
            Map<String, Object> payload =
                    objectMapper.readValue(message, Map.class);

            ContentAnalytics analytics = ContentAnalytics.builder()
                    .userId(payload.get("userId") != null
                            ? Long.valueOf(payload.get("userId").toString()) : null)
                    .analyticsType(AnalyticsType.SEARCH)
                    .source("SEARCH:" + payload.getOrDefault("query", ""))
                    .metricValue(1)
                    .build();

            repository.save(analytics);

        } catch (Exception e) {
            log.error("Failed to process search event: {}", e.getMessage());
        }
    }

    private void save(Map<String, Object> payload, AnalyticsType type) {

        Long userId = payload.get("userId") != null
                ? Long.valueOf(payload.get("userId").toString())
                : null;

        Long contentId = payload.get("contentId") != null
                ? Long.valueOf(payload.get("contentId").toString())
                : null;

        // Prevent duplicate READ events
        if (userId != null
                && contentId != null
                && repository.existsByUserIdAndContentIdAndAnalyticsType(
                userId,
                contentId,
                type)) {

            log.info("Duplicate {} ignored. user={}, content={}",
                    type,
                    userId,
                    contentId);

            return;
        }

        ContentAnalytics analytics = ContentAnalytics.builder()
                .userId(userId)
                .contentId(contentId)
                .analyticsType(type)
                .category(payload.get("category") != null
                        ? payload.get("category").toString()
                        : null)
                .source(payload.getOrDefault("source", type.name()).toString())
                .metricValue(1)
                .build();

        repository.save(analytics);
    }

    @KafkaListener(
            topics = "user.article.impression",
            groupId = "analytics-group"
    )
    public void onImpression(String message) {

        try {

            Map<String, Object> payload =
                    objectMapper.readValue(
                            message,
                            Map.class
                    );

            ContentAnalytics analytics =
                    ContentAnalytics.builder()
                            .userId(
                                    Long.valueOf(
                                            payload.get("userId").toString()
                                    )
                            )
                            .contentId(
                                    Long.valueOf(
                                            payload.get("contentId").toString()
                                    )
                            )
                            .analyticsType(AnalyticsType.IMPRESSION)
                            .source("IMPRESSION")
                            .metricValue(1)
                            .build();

                repository.save(analytics);

            log.info(
                    "IMPRESSION SAVED FOR CONTENT {}",
                    payload.get("contentId")
            );

        } catch (Exception e) {

            log.error(
                    "Failed to process impression event: {}",
                    e.getMessage()
            );
        }
    }

    @KafkaListener(
            topics = "user.article.clicked",
            groupId = "analytics-group"
    )
    public void onArticleClick(String message) {

        try {

            Map<String, Object> payload =
                    objectMapper.readValue(message, Map.class);

            ContentAnalytics analytics =
                    ContentAnalytics.builder()
                            .userId(
                                    Long.valueOf(
                                            payload.get("userId").toString()
                                    )
                            )
                            .contentId(
                                    Long.valueOf(
                                            payload.get("contentId").toString()
                                    )
                            )
                            .analyticsType(
                                    AnalyticsType.CLICK
                            )
                            .source("ARTICLE_CLICK")
                            .metricValue(1)
                            .build();

            repository.save(analytics);

            log.info(
                    "ARTICLE CLICK SAVED FOR CONTENT {}",
                    payload.get("contentId")
            );

        } catch (Exception e) {

            log.error(
                    "Failed to process article click: {}",
                    e.getMessage()
            );
        }
    }

    @KafkaListener(
            topics = "user.session.duration",
            groupId = "analytics-group"
    )
    public void onSessionDuration(String message) {

        try {

            Map<String, Object> payload =
                    objectMapper.readValue(message, Map.class);

            ContentAnalytics analytics =
                    ContentAnalytics.builder()
                            .userId(
                                    Long.valueOf(
                                            payload.get("userId").toString()
                                    )
                            )
                            .analyticsType(AnalyticsType.SESSION)
                            .source("SESSION_DURATION")
                            .metricValue(
                                    Integer.valueOf(
                                            payload.get("durationSeconds").toString()
                                    )
                            )
                            .build();

            repository.save(analytics);

            log.info(
                    "SESSION DURATION SAVED: {} seconds",
                    payload.get("durationSeconds")
            );

        } catch (Exception e) {

            log.error(
                    "Failed to process session duration: {}",
                    e.getMessage()
            );
        }
    }

    @KafkaListener(
            topics = "user.device",
            groupId = "analytics-group"
    )
    public void onDevice(String message) {

        try {

            Map<String, Object> payload =
                    objectMapper.readValue(message, Map.class);
            boolean isMobile = Boolean.parseBoolean(
                    payload.getOrDefault("isMobile", "false").toString()
            );


            ContentAnalytics analytics =
                    ContentAnalytics.builder()
                            .userId(
                                    Long.valueOf(
                                            payload.get("userId").toString()
                                    )
                            )
                            .analyticsType(AnalyticsType.DEVICE)
                            .source("DEVICE:" + (isMobile ? "mobile" : "desktop")) // ✅ consistent strings
                            .metricValue(1)
                            .build();

            repository.save(analytics);

            log.info(
                    "DEVICE SAVED: {}",
                    payload.get("isMobile")
            );

        } catch (Exception e) {

            log.error(
                    "Failed to process device: {}",
                    e.getMessage()
            );
        }
    }

    @KafkaListener(
            topics = "user.referral",
            groupId = "analytics-group"
    )
    public void onReferral(String message) {

        try {

            Map<String, Object> payload =
                    objectMapper.readValue(message, Map.class);

            ContentAnalytics analytics =
                    ContentAnalytics.builder()
                            .userId(
                                    payload.get("referrerId") != null
                                            ? Long.valueOf(
                                            payload.get("referrerId")
                                                    .toString()
                                    )
                                            : null
                            )
                            .contentId(
                                    payload.get("contentId") != null
                                            ? Long.valueOf(
                                            payload.get("contentId")
                                                    .toString()
                                    )
                                            : null
                            )
                            .analyticsType(AnalyticsType.REFERRAL)
                            .source("REFERRAL")
                            .metricValue(1)
                            .build();

            repository.save(analytics);

            log.info(
                    "REFERRAL SAVED FOR CONTENT {}",
                    payload.get("contentId")
            );

        } catch (Exception e) {

            log.error(
                    "Failed to process referral: {}",
                    e.getMessage()
            );
        }
    }
}