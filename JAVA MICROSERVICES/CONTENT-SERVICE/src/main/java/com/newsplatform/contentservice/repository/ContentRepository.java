package com.newsplatform.contentservice.repository;

import com.newsplatform.contentservice.entity.Comment;
import com.newsplatform.contentservice.entity.Content;
import com.newsplatform.contentservice.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {

    List<Content>
    findByIsPublishedTrueAndIsRemovedFalse();

    List<Content>
    findByCategoryAndIsPublishedTrueAndIsRemovedFalse(
            String category
    );

    List<Content>
    findByLanguageAndIsPublishedTrueAndIsRemovedFalse(
            Language language
    );

    List<Content>
    findByIsTrendingTrueAndIsPublishedTrueAndIsRemovedFalse();

    List<Content>
    findByCategoryAndLanguageAndIsPublishedTrueAndIsRemovedFalse(
            String category,
            Language language
    );

    List<Content>
    findByIsPublishedTrueAndIsRemovedFalseOrderByPublishedAtDesc();

    Page<Content>
    findByIsPublishedTrueAndIsRemovedFalse(
            Pageable pageable
    );

    // Add this method to your existing ContentRepository interface:

    List<Content>
    findByIsPublishedTrueAndIsRemovedFalseAndMemeCreatedFalseAndTagsContainingOrderByPublishedAtDesc(
            String tag
    );

    List<Content> findByIsRemovedTrue();
    @Query("""
    SELECT DISTINCT c FROM Content c
    WHERE c.isPublished = true
    AND c.isRemoved = false
    AND KEY(c.translatedTitle) = :langCode
    """)
    List<Content> findByTranslationLanguageCode(@Param("langCode") String langCode);

    @Query("""
    SELECT c FROM Content c
    WHERE c.isPublished = true
    AND c.isRemoved = false
    AND EXISTS (
        SELECT 1 FROM c.translatedSummary ts
        WHERE KEY(ts) = :langCode
    )
    ORDER BY c.publishedAt DESC
    """)
    List<Content> findByTranslationLangCode(@Param("langCode") String langCode);



    @Repository
    public interface CommentRepository extends JpaRepository<Comment, Long> {

        List<Comment> findByContentIdOrderByCreatedAtDesc(Long contentId);


    }

    @Query("SELECT c FROM Content c WHERE c.isPublished = true AND (c.isRemoved = false OR c.isRemoved IS NULL) ORDER BY c.publishedAt DESC")
    Page<Content> findPublishedContent(Pageable pageable);
}