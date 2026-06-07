package com.newsplatform.analyticsservice.controller;

import com.newsplatform.analyticsservice.dto.*;
import com.newsplatform.analyticsservice.entity.AnalyticsType;
import com.newsplatform.analyticsservice.repository.ContentAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ContentAnalyticsRepository repository;

    // ── Overview ─────────────────────────────────────
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        Map<String, Object> data = new LinkedHashMap<>();

        data.put("totalReads",    repository.countByAnalyticsType(AnalyticsType.VIEW));
        data.put("totalShares",   repository.countByAnalyticsType(AnalyticsType.SHARE));
        data.put("totalComments", repository.countByAnalyticsType(AnalyticsType.CLICK));
        data.put("totalUsers",    repository.countBySource("REGISTRATION"));
        data.put(
                "newUsersToday",
                repository.countBySourceAndCreatedAtAfter(
                        "REGISTRATION",
                        LocalDate.now().atStartOfDay()
                )
        );
        data.put(
                "newUsersThisWeek",
                repository.countBySourceAndCreatedAtAfter(
                        "REGISTRATION",
                        LocalDateTime.now().minusDays(7)
                )
        );

        return ResponseEntity.ok(data);
    }

    // ── Daily engagement ─────────────────────────────
    @GetMapping("/engagement/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyEngagement(
            @RequestParam(defaultValue = "14") int days) {

        List<Object[]> rows = repository.findDailyEngagement(
                LocalDateTime.now().minusDays(days));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date",  row[0].toString());
            item.put("type",  row[1].toString());
            item.put("total", row[2]);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // ── Top articles ─────────────────────────────────
    @GetMapping("/content/top-articles")
    public ResponseEntity<List<Map<String, Object>>> getTopArticles(
            @RequestParam(defaultValue = "10") int limit) {

        List<Object[]> rows = repository.findTopArticles();
        List<Map<String, Object>> result = new ArrayList<>();
        int count = 0;
        for (Object[] row : rows) {
            if (count++ >= limit) break;
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("contentId", row[0]);
            item.put("category",  row[1]);
            item.put("reads",     row[2]);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // ── By category ──────────────────────────────────
    @GetMapping("/content/by-category")
    public ResponseEntity<List<Map<String, Object>>> getByCategory() {
        List<Object[]> rows = repository.findReadsByCategory();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("category", row[0]);
            item.put("reads",    row[1]);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // ── Peak hours ───────────────────────────────────
    @GetMapping("/content/peak-hours")
    public ResponseEntity<List<Map<String, Object>>> getPeakHours() {
        List<Object[]> rows = repository.findPeakHours();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("hour",  row[0]);
            item.put("reads", row[1]);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // ── User growth ──────────────────────────────────
    @GetMapping("/users/growth")
    public ResponseEntity<List<Map<String, Object>>> getUserGrowth(
            @RequestParam(defaultValue = "30") int days) {

        List<Object[]> rows = repository.findUserGrowth(
                LocalDateTime.now().minusDays(days));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date",  row[0].toString());
            item.put("count", row[1]);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/session")
    public ResponseEntity<Map<String, Object>> getSessionStats() {

        Double avgSession =
                repository.avgSessionDuration();

        Map<String, Object> data =
                new LinkedHashMap<>();

        data.put(
                "avgSessionSeconds",
                avgSession != null ? avgSession : 0
        );

        data.put(
                "totalSessions",
                repository.countBySource(
                        "SESSION_DURATION"
                )
        );

        return ResponseEntity.ok(data);
    }

    @GetMapping("/content/ctr")
    public ResponseEntity<Map<String, Object>> getCTR() {

        long impressions =
                repository.countBySource("IMPRESSION");

        long clicks =
                repository.countBySource("ARTICLE_CLICK");

        Map<String, Object> data =
                new LinkedHashMap<>();

        data.put("impressions", impressions);
        data.put("clicks", clicks);

        data.put(
                "ctr",
                impressions > 0
                        ? String.format(
                        "%.2f",
                        (clicks * 100.0) / impressions
                ) + "%"
                        : "0%"
        );

        return ResponseEntity.ok(data);
    }

    @GetMapping("/users/searches")
    public ResponseEntity<List<Map<String, Object>>> getSearches() {

        List<Object[]> rows =
                repository.findTopSearches();

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "query",
                    row[0]
                            .toString()
                            .replace("SEARCH:", "")
            );

            item.put(
                    "count",
                    row[1]
            );

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/devices")
    public ResponseEntity<Map<String, Object>> getDevices() {

        long mobile =
                repository.countBySourceContaining(
                        "DEVICE:mobile"
                );

        long desktop =
                repository.countBySourceContaining(
                        "DEVICE:desktop"
                );

        Map<String, Object> data =
                new LinkedHashMap<>();

        data.put("mobile", mobile);
        data.put("desktop", desktop);

        long total = mobile + desktop;

        data.put(
                "mobileRate",
                total > 0
                        ? String.format(
                        "%.1f",
                        mobile * 100.0 / total
                ) + "%"
                        : "0%"
        );

        data.put(
                "desktopRate",
                total > 0
                        ? String.format(
                        "%.1f",
                        desktop * 100.0 / total
                ) + "%"
                        : "0%"
        );

        return ResponseEntity.ok(data);
    }

    @GetMapping("/users/referrals")
    public ResponseEntity<Map<String, Object>> getReferrals() {

        long referrals =
                repository.countBySource(
                        "REFERRAL"
                );

        return ResponseEntity.ok(
                Map.of(
                        "totalReferrals",
                        referrals
                )
        );
    }

    @GetMapping("/users/dau")
    public ResponseEntity<Map<String, Object>> getDAU() {

        long dau =
                repository.countActiveUsersSince(
                        LocalDate.now()
                                .atStartOfDay()
                );

        return ResponseEntity.ok(
                Map.of(
                        "dailyActiveUsers",
                        dau
                )
        );
    }

    @GetMapping("/users/retention")
    public ResponseEntity<Map<String, Object>> getRetention() {

        long activeLast30Days =
                repository.countDistinctUsersSince(
                        LocalDateTime.now().minusDays(30)
                );

        long activeLast7Days =
                repository.countDistinctUsersSince(
                        LocalDateTime.now().minusDays(7)
                );

        double retention =
                activeLast30Days > 0
                        ? (activeLast7Days * 100.0)
                        / activeLast30Days
                        : 0;

        return ResponseEntity.ok(
                Map.of(
                        "activeLast30Days",
                        activeLast30Days,
                        "activeLast7Days",
                        activeLast7Days,
                        "retentionRate",
                        String.format(
                                "%.2f%%",
                                retention
                        )
                )
        );
    }
}