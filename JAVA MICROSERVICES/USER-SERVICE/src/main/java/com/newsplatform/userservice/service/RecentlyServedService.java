package com.newsplatform.userservice.service;

import java.util.List;

public interface RecentlyServedService {

    List<Long> getRecentlyServedArticles(Long authUserId);

    void saveRecentlyServedArticles(
            Long authUserId,
            List<Long> articleIds
    );
}