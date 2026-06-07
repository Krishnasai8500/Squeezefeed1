package com.newsplatform.contentservice.service;

import com.newsplatform.contentservice.dto.*;
import com.newsplatform.contentservice.entity.MemePost;

import java.util.List;
import com.newsplatform.contentservice.entity.Comment;
import com.newsplatform.contentservice.dto.CreateCommentRequest;
public interface ContentService {

    ContentAdminResponse createContent(CreateContentRequest request);

    ContentResponse getContentById(Long contentId);
    List<MemePost> getAllPublishedMemes();

    ContentAdminResponse getAdminContentById(Long contentId);

    List<ContentResponse> getAllPublishedContent(
            Long authUserId,
            int page,
            int size
    );

    List<ContentResponse> getContentByCategory(String category);

    List<ContentResponse> getContentByLanguage(String language);

    List<ContentResponse> getTrendingContent();

    List<ContentResponse> getContentByCategoryAndLanguage(
            String category,
            String language
    );

    ContentAdminResponse updateContent(
            Long contentId,
            UpdateContentRequest request
    );

    MemePost createMemePost(
            CreateMemePostRequest request
    );

    MemePost updateMemePost(
            Long memeId,
            CreateMemePostRequest request
    );
    List<ContentResponse> getMemeCandidates();

    List<ContentResponse> getSavedArticles(
            Long authUserId
    );

    List<Comment> getCommentsByContentId(
            Long contentId
    );

    Comment createComment(
            CreateCommentRequest request
    );
    void deleteMemePost(Long memeId);
    void deleteContent(Long contentId);

    void incrementViewCount(Long contentId);

    void incrementShareCount(Long contentId);

    void removeContent(Long contentId);

    void restoreContent(Long contentId);

    List<ContentAdminResponse> getRemovedContent();
}