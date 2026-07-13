package com.newsplatform.contentservice.recommendation;

import com.newsplatform.contentservice.dto.ContentResponse;
import com.newsplatform.contentservice.dto.UserProfileResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
public class FeedRecommendationService {

    public List<ContentResponse> rankFeed(
            List<ContentResponse> articles,
            UserProfileResponse profile
    ) {

        List<ContentResponse> preferred = new ArrayList<>();
        List<ContentResponse> local = new ArrayList<>();
        List<ContentResponse> trending = new ArrayList<>();
        List<ContentResponse> general = new ArrayList<>();
        for (ContentResponse article : articles) {

            boolean isPreferred = profile != null
                    && profile.getPreferredCategories() != null
                    && profile.getPreferredCategories()
                    .stream()
                    .anyMatch(cat -> cat.equalsIgnoreCase(article.getCategory()));

            boolean isLocal =
                    (profile != null)
                            && (
                            (profile.getCity() != null
                                    && article.getArticleCity() != null
                                    && profile.getCity().equalsIgnoreCase(article.getArticleCity()))
                                    ||
                                    (profile.getState() != null
                                            && article.getArticleState() != null
                                            && profile.getState().equalsIgnoreCase(article.getArticleState()))
                    );

            if (isPreferred) {
                preferred.add(article);
            }
            else if (isLocal) {
                local.add(article);
            }
            else if (Boolean.TRUE.equals(article.getIsTrending())) {
                trending.add(article);
            }
            else {
                general.add(article);
            }
        }



        preferred.sort(
                Comparator
                        .comparingInt((ContentResponse a) -> calculateScore(a, profile))
                        .thenComparing(ContentResponse::getPublishedAt)
                        .reversed()
        );

        local.sort(
                Comparator
                        .comparingInt((ContentResponse a) -> calculateScore(a, profile))
                        .thenComparing(ContentResponse::getPublishedAt)
                        .reversed()
        );

        trending.sort(
                Comparator
                        .comparingInt((ContentResponse a) -> calculateScore(a, profile))
                        .thenComparing(ContentResponse::getPublishedAt)
                        .reversed()
        );

        general.sort(
                Comparator
                        .comparingInt((ContentResponse a) -> calculateScore(a, profile))
                        .thenComparing(ContentResponse::getPublishedAt)
                        .reversed()
        );



        if (profile == null
                || profile.getPreferredCategories() == null
                || profile.getPreferredCategories().isEmpty()) {

            return articles;
        }

//        return articles.stream()
//                .sorted(
//                        Comparator
//                                .comparingInt(
//                                        (ContentResponse article) ->
//                                                calculateScore(article, profile)
//                                )
//                                .reversed()
//                )
//                .toList();

        List<ContentResponse> finalFeed = new ArrayList<>();

        interleaveFeed(
                finalFeed,
                preferred,
                local,
                trending,
                general
        );

// Fallback if we still have less than 20
        completeFeed(
                finalFeed,
                preferred,
                local,
                trending,
                general
        );



        if (finalFeed.size() > 20) {
            finalFeed = new ArrayList<>(finalFeed.subList(0, 20));
        }

        System.out.println("Final Feed Size = " + finalFeed.size());
        return finalFeed;
    }

    private int calculateScore(
            ContentResponse article,
            UserProfileResponse profile
    ) {

        int score = 0;

        // Preferred Category
        if (article.getCategory() != null
                && profile.getPreferredCategories() != null
                && profile.getPreferredCategories()
                .stream()
                .anyMatch(cat -> cat.equalsIgnoreCase(article.getCategory()))) {

            score += 40;
        }

        // Same City
        if (article.getArticleCity() != null
                && profile.getCity() != null
                && article.getArticleCity().equalsIgnoreCase(profile.getCity())) {

            score += 30;
        }

        // Same State
        if (article.getArticleState() != null
                && profile.getState() != null
                && article.getArticleState().equalsIgnoreCase(profile.getState())) {

            score += 15;
        }

        // Trending boost
        if (Boolean.TRUE.equals(article.getIsTrending())) {
            score += 20;
        }

        return score;
    }




    private void completeFeed(
            List<ContentResponse> finalFeed,
            List<ContentResponse> preferred,
            List<ContentResponse> local,
            List<ContentResponse> trending,
            List<ContentResponse> general
    ) {

        List<List<ContentResponse>> buckets = List.of(
                preferred,
                local,
                trending,
                general
        );

        for (List<ContentResponse> bucket : buckets) {

            for (ContentResponse article : bucket) {

                if (finalFeed.size() >= 40) {
                    return;
                }

                if (!finalFeed.contains(article)) {
                    finalFeed.add(article);
                }
            }
        }
    }

    private void interleaveFeed(
            List<ContentResponse> finalFeed,
            List<ContentResponse> preferred,
            List<ContentResponse> local,
            List<ContentResponse> trending,
            List<ContentResponse> general
    ) {

        int p = 0;
        int l = 0;
        int t = 0;
        int g = 0;

        while (finalFeed.size() < 40) {

            if (p < preferred.size() && finalFeed.size() < 40) {
                finalFeed.add(preferred.get(p++));
            }

            if (l < local.size() && finalFeed.size() < 40) {
                finalFeed.add(local.get(l++));
            }

            if (t < trending.size() && finalFeed.size() < 40) {
                finalFeed.add(trending.get(t++));
            }

            if (g < general.size() && finalFeed.size() < 40) {
                finalFeed.add(general.get(g++));
            }

            if (p >= preferred.size()
                    && l >= local.size()
                    && t >= trending.size()
                    && g >= general.size()) {
                break;
            }
        }
    }
}