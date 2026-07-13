package com.newsplatform.userservice.repository;

import com.newsplatform.userservice.entity.RecentlyServedArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecentlyServedArticleRepository
        extends JpaRepository<RecentlyServedArticle, Long> {

    List<RecentlyServedArticle>
    findTop50ByAuthUserIdOrderByServedAtDesc(Long authUserId);

    void deleteByAuthUserIdAndContentIdIn(
            Long authUserId,
            List<Long> contentIds
    );
}