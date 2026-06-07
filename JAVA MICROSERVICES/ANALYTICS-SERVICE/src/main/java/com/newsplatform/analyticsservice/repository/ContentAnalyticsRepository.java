package com.newsplatform.analyticsservice.repository;

import com.newsplatform.analyticsservice.entity.AnalyticsType;
import com.newsplatform.analyticsservice.entity.ContentAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ContentAnalyticsRepository
        extends JpaRepository<ContentAnalytics, Long> {

    List<ContentAnalytics> findByContentId(Long contentId);
    List<ContentAnalytics> findByUserId(Long userId);
    List<ContentAnalytics> findByAnalyticsType(AnalyticsType type);
    List<ContentAnalytics> findByCategory(String category);

    // ── Overview counts ──────────────────────────────
    long countByAnalyticsType(AnalyticsType type);

    long countBySource(String source);

    long countByCreatedAtAfter(LocalDateTime after);

    // ── Daily engagement (last N days) ───────────────
    @Query("""
        SELECT CAST(a.createdAt AS date) as date,
               a.analyticsType as type,
               COUNT(a) as total
        FROM ContentAnalytics a
        WHERE a.createdAt >= :from
        GROUP BY CAST(a.createdAt AS date), a.analyticsType
        ORDER BY CAST(a.createdAt AS date)
    """)
    List<Object[]> findDailyEngagement(@Param("from") LocalDateTime from);

    // ── Top articles by read count ───────────────────
    @Query("""
        SELECT a.contentId, a.category, COUNT(a) as total
        FROM ContentAnalytics a
        WHERE a.analyticsType = 'VIEW'
          AND a.contentId IS NOT NULL
        GROUP BY a.contentId, a.category
        ORDER BY total DESC
    """)
    List<Object[]> findTopArticles();

    // ── Reads by category ────────────────────────────
    @Query("""
        SELECT a.category, COUNT(a) as total
        FROM ContentAnalytics a
        WHERE a.analyticsType = 'VIEW'
          AND a.category IS NOT NULL
        GROUP BY a.category
        ORDER BY total DESC
    """)
    List<Object[]> findReadsByCategory();

    // ── Peak hours ───────────────────────────────────
    @Query("""
        SELECT HOUR(a.createdAt) as hour, COUNT(a) as total
        FROM ContentAnalytics a
        WHERE a.analyticsType = 'VIEW'
        GROUP BY HOUR(a.createdAt)
        ORDER BY hour
    """)
    List<Object[]> findPeakHours();

    // ── User growth (registrations per day) ─────────
    @Query("""
        SELECT CAST(a.createdAt AS date) as date, COUNT(a) as total
        FROM ContentAnalytics a
        WHERE a.source = 'REGISTRATION'
          AND a.createdAt >= :from
        GROUP BY CAST(a.createdAt AS date)
        ORDER BY CAST(a.createdAt AS date)
    """)
    List<Object[]> findUserGrowth(@Param("from") LocalDateTime from);

    @Query("""
    SELECT AVG(a.metricValue)
    FROM ContentAnalytics a
    WHERE a.source = 'SESSION_DURATION'
""")
    Double avgSessionDuration();

    @Query("""
    SELECT a.source, COUNT(a) as total
    FROM ContentAnalytics a
    WHERE a.source LIKE 'SEARCH:%'
    GROUP BY a.source
    ORDER BY total DESC
""")
    List<Object[]> findTopSearches();

    long countBySourceContaining(String sourceFragment);

    @Query("""
    SELECT COUNT(DISTINCT a.userId)
    FROM ContentAnalytics a
    WHERE a.createdAt >= :from
      AND a.userId IS NOT NULL
""")
    long countActiveUsersSince(
            @Param("from")
            LocalDateTime from
    );

    @Query("""
    SELECT COUNT(DISTINCT a.userId)
    FROM ContentAnalytics a
    WHERE a.createdAt >= :from
      AND a.userId IS NOT NULL
""")
    long countDistinctUsersSince(
            @Param("from")
            LocalDateTime from
    );

    long countBySourceAndCreatedAtAfter(
            String source,
            LocalDateTime after
    );

    boolean existsBySourceAndUserId(String source, Long userId);
}
