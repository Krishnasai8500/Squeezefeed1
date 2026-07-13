package com.newsplatform.userservice.service.impl;

import com.newsplatform.userservice.entity.RecentlyServedArticle;
import com.newsplatform.userservice.repository.RecentlyServedArticleRepository;
import com.newsplatform.userservice.service.RecentlyServedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecentlyServedServiceImpl
        implements RecentlyServedService {

    private final RecentlyServedArticleRepository repository;

    @Override
    public List<Long> getRecentlyServedArticles(Long authUserId) {

        return repository
                .findTop50ByAuthUserIdOrderByServedAtDesc(authUserId)
                .stream()
                .map(RecentlyServedArticle::getContentId)
                .toList();
    }

    @Override
    public void saveRecentlyServedArticles(
            Long authUserId,
            List<Long> articleIds
    ) {

        for (Long articleId : articleIds) {

            RecentlyServedArticle article =
                    RecentlyServedArticle.builder()
                            .authUserId(authUserId)
                            .contentId(articleId)
                            .build();

            repository.save(article);
        }
    }
}