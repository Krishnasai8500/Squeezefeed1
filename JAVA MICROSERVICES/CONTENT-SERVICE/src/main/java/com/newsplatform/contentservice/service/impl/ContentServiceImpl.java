    package com.newsplatform.contentservice.service.impl;
    
    import com.newsplatform.contentservice.client.NotificationServiceClient;
    import com.newsplatform.contentservice.client.UserServiceClient;
    import com.newsplatform.contentservice.dto.*;
    import com.newsplatform.contentservice.entity.Content;
    import com.newsplatform.contentservice.entity.Language;
    import com.newsplatform.contentservice.repository.ContentRepository;
    import com.newsplatform.contentservice.service.ContentService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import com.newsplatform.contentservice.dto.CreateMemePostRequest;
    import java.time.LocalDateTime;
    import java.util.List;
    import com.newsplatform.contentservice.service.TagGenerator;
    import com.newsplatform.contentservice.entity.MemePost;
    import com.newsplatform.contentservice.repository.MemePostRepository;
    import org.springframework.web.client.RestTemplate;
    import com.newsplatform.contentservice.entity.Comment;
    import com.newsplatform.contentservice.repository.CommentRepository;
    import org.springframework.data.domain.PageRequest;
    import org.springframework.data.domain.Pageable;
    import org.springframework.data.domain.Sort;
    import java.util.*;
    import org.apache.commons.text.StringEscapeUtils;
    @Service
    @RequiredArgsConstructor
    public class ContentServiceImpl implements ContentService {
    
        private final ContentRepository contentRepository;
        private final TagGenerator tagGenerator;
        private final MemePostRepository memePostRepository;
        private final CommentRepository commentRepository;
        private final RestTemplate restTemplate;
        private final UserServiceClient userServiceClient;


        private final NotificationServiceClient notificationServiceClient;
    
        @Override
        public ContentAdminResponse createContent(CreateContentRequest request) {
    
            Boolean published = request.getIsPublished() != null
                    ? request.getIsPublished()
                    : true;

            String detectedCategory =
                    request.getCategory();

            List<String> generatedTags =
                    request.getTags();
            System.out.println("TRANSLATED TITLE:");
            System.out.println(request.getTranslatedTitle());
    
            System.out.println("TRANSLATED SUMMARY:");
            System.out.println(request.getTranslatedSummary());
            System.out.println("SUMMARY RECEIVED:");
            System.out.println(request.getSummary());

            System.out.println("CATEGORY RECEIVED:");
            System.out.println(request.getCategory());

            System.out.println("TAGS RECEIVED:");
            System.out.println(request.getTags());
            String cleanTitle =
                    StringEscapeUtils.unescapeHtml4(
                            request.getTitle()
                    );

            String cleanDescription =
                    StringEscapeUtils.unescapeHtml4(
                            request.getDescription()
                    );

            String cleanSummary =
                    StringEscapeUtils.unescapeHtml4(
                            request.getSummary()
                    );

            String cleanFullContent =
                    StringEscapeUtils.unescapeHtml4(
                            request.getFullContent()
                    );

            Content content = Content.builder()
                    .title(cleanTitle)
                    .description(cleanDescription)
                    .fullContent(cleanFullContent)
                    .summary(cleanSummary)
                    .translatedTitle(request.getTranslatedTitle())
                    .translatedSummary(request.getTranslatedSummary())
                    .author(request.getAuthor())
                    .sourceUrl(request.getSourceUrl())
                    .category(
                            detectedCategory != null
                                    ? detectedCategory
                                    : "general"
                    )

                    .tags(
                            generatedTags != null
                                    ? generatedTags
                                    : List.of()
                    )
                    .language(request.getLanguage())

                    .imageUrl(request.getImageUrl())
                    .isPublished(published)
                    .isTrending(false)
                    .publishedAt(published ? LocalDateTime.now() : null)
                    .build();
    
            Content savedContent = contentRepository.save(content);

            System.out.println(
                    "CONTENT SAVED: "
                            + savedContent.getTitle()
            );




            List<Long> users =
                    userServiceClient.getUsersByCategory(
                            savedContent.getCategory()
                    );

            System.out.println(
                    "MATCHING USERS: "
                            + users.size()
            );




            for (Long userId : users) {

                NotificationRequestDTO notification =
                        new NotificationRequestDTO();

                notification.setContentId(
                        savedContent.getId()
                );

                notification.setUserId(userId);

                String language =
                        userServiceClient
                                .getUserLanguage(userId);

                if ("TELUGU".equalsIgnoreCase(language)) {

                    notification.setTitle(
                            savedContent
                                    .getTranslatedTitle()
                                    .getOrDefault(
                                            "te",
                                            savedContent.getTitle()
                                    )
                    );

                    notification.setMessage(
                            savedContent
                                    .getTranslatedSummary()
                                    .getOrDefault(
                                            "te",
                                            savedContent.getSummary()
                                    )
                    );
                }
                else {

                    notification.setTitle(
                            savedContent.getTitle()
                    );

                    notification.setMessage(
                            savedContent.getSummary()
                    );
                }

                notification.setType(
                        "CONTENT_PUBLISHED"
                );

                notification.setDeliveryChannel(
                        "IN_APP"
                );

                notificationServiceClient
                        .createNotification(
                                notification
                        );

                System.out.println(
                        "NOTIFICATION CREATED FOR USER: "
                                + userId
                );
            }

            return mapToAdminResponse(savedContent);
        }

        @Override
        public ContentResponse getContentById(Long contentId) {

            Content content = contentRepository.findById(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found"));

            incrementViewCount(contentId);

            return mapToPublicResponse(content);
        }

        @Override
        public ContentAdminResponse getAdminContentById(Long contentId) {

            Content content = contentRepository.findById(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found"));

            return mapToAdminResponse(content);
        }
        @Override
        public List<ContentResponse> getAllPublishedContent(
                Long authUserId,
                int page,
                int size
        ) {
            System.out.println("FEED REQUEST USER ID: " + authUserId);

            UserProfileResponse profile = null;
            try {
                //localrun
//                String profileUrl = "http://localhost:8082/api/users/profile/" + authUserId;
                String profileUrl = "http://user-service:8082/api/users/profile/" + authUserId;
                profile = restTemplate.getForObject(profileUrl, UserProfileResponse.class);
            } catch (Exception e) {
                System.out.println("Could not fetch user profile: " + e.getMessage());
            }

            final UserProfileResponse finalProfile = profile;

            Pageable pageable = PageRequest.of(
                    page,
                    size,
                    Sort.by("publishedAt").descending()
            );

            List<ContentResponse> articles = contentRepository
                    .findPublishedContent(pageable)
                    .stream()
                    .map(this::mapToPublicResponse)
                    .toList();

            // Only personalise if we have a valid profile with preferences
            if (finalProfile != null
                    && finalProfile.getPreferredCategories() != null
                    && !finalProfile.getPreferredCategories().isEmpty()) {

                articles = articles.stream()
                        .sorted((a, b) -> {
                            int scoreA = 0;
                            int scoreB = 0;

                            if (a.getArticleCity() != null
                                    && finalProfile.getCity() != null
                                    && a.getArticleCity().equalsIgnoreCase(finalProfile.getCity())) {
                                scoreA += 15;
                            }
                            if (a.getArticleState() != null
                                    && finalProfile.getState() != null
                                    && a.getArticleState().equalsIgnoreCase(finalProfile.getState())) {
                                scoreA += 5;
                            }
                            if (finalProfile.getPreferredCategories().stream()
                                    .anyMatch(cat -> cat.equalsIgnoreCase(a.getCategory()))) {
                                scoreA += 10;
                            }

                            if (b.getArticleCity() != null
                                    && finalProfile.getCity() != null
                                    && b.getArticleCity().equalsIgnoreCase(finalProfile.getCity())) {
                                scoreB += 15;
                            }
                            if (b.getArticleState() != null
                                    && finalProfile.getState() != null
                                    && b.getArticleState().equalsIgnoreCase(finalProfile.getState())) {
                                scoreB += 5;
                            }
                            if (finalProfile.getPreferredCategories().stream()
                                    .anyMatch(cat -> cat.equalsIgnoreCase(b.getCategory()))) {
                                scoreB += 10;
                            }
    
                            // If scores are equal, keep original publishedAt order (newer first)
                            if (scoreA == scoreB) {
                                return 0; // preserve DB sort order
                            }
                            return Integer.compare(scoreB, scoreA);
                        })
                        .toList();
            }
    
            // ✅ REMOVED applyCategoryDiversity() — it was silently dropping new articles
            return articles;
        }
    
        @Override
        public List<ContentResponse> getContentByCategory(String category) {
            return contentRepository.findByCategoryAndIsPublishedTrueAndIsRemovedFalse(category)
                    .stream()
                    .map(this::mapToPublicResponse)
                    .toList();
        }
    
        @Override
        public List<ContentResponse> getContentByLanguage(String language) {
    
            if (language.equalsIgnoreCase("ENGLISH")) {
                return contentRepository
                        .findByLanguageAndIsPublishedTrueAndIsRemovedFalse(Language.ENGLISH)
                        .stream()
                        .map(this::mapToPublicResponse)
                        .toList();
            }
    
            String langCode = language.equalsIgnoreCase("TELUGU") ? "te" : "hi";
    
            return contentRepository
                    .findByTranslationLangCode(langCode)
                    .stream()
                    .map(this::mapToPublicResponse)
                    .toList();
        }
        @Override
        public List<ContentResponse> getTrendingContent() {
            return contentRepository.findByIsTrendingTrueAndIsPublishedTrueAndIsRemovedFalse()
                    .stream()
                    .map(this::mapToPublicResponse)
                    .toList();
        }
    
        @Override
        public List<ContentResponse> getContentByCategoryAndLanguage(
                String category,
                String language
        ) {
    
            Language langEnum = Language.valueOf(language.toUpperCase());
    
            return contentRepository
                    .findByCategoryAndLanguageAndIsPublishedTrueAndIsRemovedFalse(category, langEnum)
                    .stream()
                    .map(this::mapToPublicResponse)
                    .toList();
        }
    
        @Override
        public ContentAdminResponse updateContent(
                Long contentId,
                UpdateContentRequest request
        ) {
    
            Content content = contentRepository.findById(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found"));
    
            if (request.getTitle() != null) content.setTitle(request.getTitle());
            if (request.getDescription() != null) content.setDescription(request.getDescription());
            if (request.getFullContent() != null) content.setFullContent(request.getFullContent());
            if (request.getSummary() != null) content.setSummary(request.getSummary());
            if (request.getAuthor() != null) content.setAuthor(request.getAuthor());
            if (request.getSourceUrl() != null) content.setSourceUrl(request.getSourceUrl());
            if (request.getCategory() != null) content.setCategory(request.getCategory());
            if (request.getLanguage() != null) content.setLanguage(request.getLanguage());
            if (request.getTags() != null) content.setTags(request.getTags());
            if (request.getImageUrl() != null) content.setImageUrl(request.getImageUrl());
            if (request.getIsPublished() != null) content.setIsPublished(request.getIsPublished());
            if (request.getIsTrending() != null) content.setIsTrending(request.getIsTrending());
    
            if (Boolean.TRUE.equals(request.getIsPublished())
                    && content.getPublishedAt() == null) {
                content.setPublishedAt(LocalDateTime.now());
            }
    
            Content updatedContent = contentRepository.save(content);
    
            return mapToAdminResponse(updatedContent);
        }
    
        @Override
        public void deleteContent(Long contentId) {
    
            if (!contentRepository.existsById(contentId)) {
                throw new RuntimeException("Content not found");
            }
    
            contentRepository.deleteById(contentId);
        }
    
        @Override
        public void incrementViewCount(Long contentId) {
    
            Content content = contentRepository.findById(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found"));
    
            content.setViewCount(content.getViewCount() + 1);
    
            contentRepository.save(content);
        }
    
        @Override
        public void incrementShareCount(Long contentId) {
    
            Content content = contentRepository.findById(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found"));
    
            content.setShareCount(content.getShareCount() + 1);
    
            contentRepository.save(content);
        }
    
        @Override
        public List<MemePost> getAllPublishedMemes() {
            return memePostRepository.findByIsPublishedTrueOrderByCreatedAtDesc();
        }

        @Override
        public MemePost createMemePost(
                CreateMemePostRequest request
        ) {

            MemePost memePost = MemePost.builder()
                    .title(request.getTitle())
                    .shortContext(request.getShortContext())
                    .imageUrl(request.getImageUrl())
                    .sourceContentId(
                            request.getSourceContentId()
                    )
                    .memeabilityScore(
                            request.getMemeabilityScore()
                    )
                    .isPublished(true)
                    .build();

            MemePost savedMeme =
                    memePostRepository.save(
                            memePost
                    );

            if (request.getSourceContentId() != null) {

                Content content =
                        contentRepository.findById(
                                        request.getSourceContentId()
                                )
                                .orElseThrow(
                                        () -> new RuntimeException(
                                                "Content not found"
                                        )
                                );

                content.setMemeCreated(true);

                contentRepository.save(content);
            }

            return savedMeme;
        }
    
        @Override
        public MemePost updateMemePost(Long memeId, CreateMemePostRequest request) {
    
            MemePost memePost = memePostRepository.findById(memeId)
                    .orElseThrow(() -> new RuntimeException("Meme not found"));
    
            memePost.setTitle(request.getTitle());
            memePost.setShortContext(request.getShortContext());
            memePost.setImageUrl(request.getImageUrl());
            memePost.setMemeabilityScore(request.getMemeabilityScore());
    
            return memePostRepository.save(memePost);
        }
    
        @Override
        public void deleteMemePost(Long memeId) {
    
            if (!memePostRepository.existsById(memeId)) {
                throw new RuntimeException("Meme not found");
            }
    
            memePostRepository.deleteById(memeId);
        }
    
        // ✅ FIX: Query DB directly by tag — no more fetching ALL content and filtering in Java
        @Override
        public List<ContentResponse> getMemeCandidates() {

            return contentRepository
                    .findByIsPublishedTrueAndIsRemovedFalseAndMemeCreatedFalseAndTagsContainingOrderByPublishedAtDesc(
                            "meme-news"
                    )
                    .stream()
                    .map(this::mapToPublicResponse)
                    .toList();
        }
    
        @Override
        public List<ContentResponse> getSavedArticles(
                Long authUserId
        ) {

            //localrun
//            String url =
//                    "http://localhost:8082/api/users/saved/"
//                            + authUserId;

            String url =
                    "http://user-service:8082/api/users/saved/"
                            + authUserId;
    
            UserProfileResponse profile =
                    restTemplate.getForObject(
                            url,
                            UserProfileResponse.class
                    );
    
            if (
                    profile == null ||
                            profile.getSavedArticleIds() == null
            ) {
                return List.of();
            }
    
            return contentRepository
                    .findAllById(
                            profile.getSavedArticleIds()
                    )
                    .stream()
                    .map(this::mapToPublicResponse)
                    .toList();
        }
    
        @Override
        public List<Comment> getCommentsByContentId(
                Long contentId
        ) {
    
            return commentRepository
                    .findByContentIdOrderByCreatedAtDesc(
                            contentId
                    );
        }
    
        @Override
        public Comment createComment(
                CreateCommentRequest request
        ) {
    
            Comment comment = Comment.builder()
                    .contentId(request.getContentId())
                    .authUserId(request.getAuthUserId())
                    .username(request.getUsername())
                    .commentText(request.getCommentText())
                    .build();

            //localrun
//            String trackUrl =
//                    "http://localhost:8082/api/users/track/comment/"
//                            + request.getAuthUserId();

            String trackUrl =
                    "http://user-service:8082/api/users/track/comment/"
                            + request.getAuthUserId();
    
            try {
    
                restTemplate.postForObject(
                        trackUrl,
                        null,
                        Object.class
                );
    
            } catch (Exception e) {
    
                System.out.println(
                        "Failed to track comment badge"
                );
            }
    
            return commentRepository.save(comment);
        }
    
        private List<ContentResponse>
        applyCategoryDiversity(
    
                List<ContentResponse> articles
        ) {
    
            List<ContentResponse> diversified =
                    new ArrayList<>();
    
            Map<String, Integer> categoryCount =
                    new HashMap<>();
    
            for (ContentResponse article : articles) {
    
                String category =
                        article.getCategory();
    
                int count =
                        categoryCount.getOrDefault(
                                category,
                                0
                        );
    
                // Allow max 2 consecutive same-category boosts
                if (count >= 2) {
                    continue;
                }
    
                diversified.add(article);
    
                categoryCount.put(
                        category,
                        count + 1
                );
            }
    
            return diversified;
        }
    
        @Override
        public void removeContent(Long contentId) {
    
            Content content =
                    contentRepository
                            .findById(contentId)
                            .orElseThrow();
    
            content.setIsRemoved(true);
    
            content.setRemovedAt(
                    LocalDateTime.now()
            );
    
            contentRepository.save(content);
        }
    
        @Override
        public void restoreContent(Long contentId) {
    
            Content content =
                    contentRepository
                            .findById(contentId)
                            .orElseThrow();
    
            content.setIsRemoved(false);
    
            content.setRemovedAt(null);
    
            contentRepository.save(content);
        }
    
    
        @Override
        public List<ContentAdminResponse>
        getRemovedContent() {
    
            return contentRepository
                    .findByIsRemovedTrue()
                    .stream()
                    .map(this::mapToAdminResponse)
                    .toList();
        }
    
    
        private ContentResponse mapToPublicResponse(Content content) {

            System.out.println("TRANSLATIONS FOR " + content.getId() + ": " + content.getTranslatedTitle());

            return ContentResponse.builder()
                    .id(content.getId())
                    .title(content.getTitle())
                    .description(content.getDescription())
                    .fullContent(content.getFullContent())
                    .summary(content.getSummary())
                    .author(content.getAuthor())
                    .sourceUrl(content.getSourceUrl())
                    .category(content.getCategory())
                    .language(content.getLanguage())
                    .tags(content.getTags())
                    .imageUrl(content.getImageUrl())
                    .isPublished(content.getIsPublished())
                    .isTrending(content.getIsTrending())
                    .translatedTitle(content.getTranslatedTitle())
                    .translatedSummary(content.getTranslatedSummary())
                    .commentCount(
                            commentRepository
                                    .findByContentIdOrderByCreatedAtDesc(content.getId())
                                    .size()
                    ) // ← use COUNT query
                    .publishedAt(content.getPublishedAt())
                    .createdAt(content.getCreatedAt())
                    .updatedAt(content.getUpdatedAt())
                    .articleCity(content.getArticleCity())
                    .articleState(content.getArticleState())
                    .build();
        }
    
        private ContentAdminResponse mapToAdminResponse(Content content) {
            return ContentAdminResponse.builder()
                    .id(content.getId())
                    .title(content.getTitle())
                    .description(content.getDescription())
                    .fullContent(content.getFullContent())
                    .summary(content.getSummary())
                    .author(content.getAuthor())
                    .sourceUrl(content.getSourceUrl())
                    .category(content.getCategory())
                    .language(content.getLanguage())
                    .tags(content.getTags())
                    .imageUrl(content.getImageUrl())
                    .isPublished(content.getIsPublished())
                    .isTrending(content.getIsTrending())
                    .viewCount(content.getViewCount())
                    .shareCount(content.getShareCount())
                    .publishedAt(content.getPublishedAt())
                    .createdAt(content.getCreatedAt())
                    .updatedAt(content.getUpdatedAt())
                    .translatedTitle(content.getTranslatedTitle())
                    .translatedSummary(content.getTranslatedSummary())
                    .build();
        }
    }