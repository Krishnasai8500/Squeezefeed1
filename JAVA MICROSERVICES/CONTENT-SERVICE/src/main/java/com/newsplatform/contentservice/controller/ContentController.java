package com.newsplatform.contentservice.controller;

import com.newsplatform.contentservice.dto.*;
import com.newsplatform.contentservice.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.newsplatform.contentservice.dto.CreateMemePostRequest;

import com.newsplatform.contentservice.entity.MemePost;
import java.util.*;
import com.newsplatform.contentservice.entity.Comment;
import com.newsplatform.contentservice.dto.CreateCommentRequest;
import com.newsplatform.contentservice.config.JwtService;
@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final JwtService jwtService;

    /*
     * ============================
     * ADMIN / EDITOR ENDPOINTS
     * ============================
     */

    @PostMapping("/admin")
    public ResponseEntity<ContentAdminResponse> createContent(
            @Valid @RequestBody CreateContentRequest request
    ) {
        System.out.println("ADMIN ENDPOINT HIT");
        return ResponseEntity.ok(contentService.createContent(request));
    }

    @GetMapping("/admin/{contentId}")
    public ResponseEntity<ContentAdminResponse> getAdminContentById(
            @PathVariable Long contentId
    ) {

        return ResponseEntity.ok(contentService.getAdminContentById(contentId));
    }

    @PutMapping("/admin/{contentId}")
    public ResponseEntity<ContentAdminResponse> updateContent(
            @PathVariable Long contentId,
            @RequestBody UpdateContentRequest request
    ) {
        return ResponseEntity.ok(
                contentService.updateContent(contentId, request)
        );
    }

    @DeleteMapping("/admin/{contentId}")
    public ResponseEntity<String> deleteContent(
            @PathVariable Long contentId
    ) {
        contentService.deleteContent(contentId);

        return ResponseEntity.ok("Content deleted successfully");
    }

    /*
     * ============================
     * AUTHENTICATED USER ENDPOINTS
     * ============================
     */

    @GetMapping("/feed")
    public ResponseEntity<List<ContentResponse>> getAllPublishedContent(

            @RequestParam Long authUserId,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "20") int size
    ) {


        return ResponseEntity.ok(
                contentService.getAllPublishedContent(
                        authUserId,
                        page,
                        size
                )
        );
    }

    @GetMapping("/{contentId}")
    public ResponseEntity<ContentResponse> getContentById(
            @PathVariable Long contentId
    ) {
        return ResponseEntity.ok(contentService.getContentById(contentId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ContentResponse>> getContentByCategory(
            @PathVariable String category
    ) {
        return ResponseEntity.ok(contentService.getContentByCategory(category));
    }


    @GetMapping("/language/{language}")
    public ResponseEntity<List<ContentResponse>> getContentByLanguage(
            @PathVariable String language
    ) {
        return ResponseEntity.ok(contentService.getContentByLanguage(language));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ContentResponse>> getTrendingContent() {
        return ResponseEntity.ok(contentService.getTrendingContent());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ContentResponse>> getContentByCategoryAndLanguage(
            @RequestParam String category,
            @RequestParam String language
    ) {
        return ResponseEntity.ok(
                contentService.getContentByCategoryAndLanguage(
                        category,
                        language
                )
        );
    }

    @PostMapping("/{contentId}/share")
    public ResponseEntity<String> incrementShareCount(
            @PathVariable Long contentId
    ) {
        contentService.incrementShareCount(contentId);

        return ResponseEntity.ok("Share count updated");
    }

    @GetMapping("/memes")
    public ResponseEntity<List<MemePost>> getAllMemes() {

        return ResponseEntity.ok(
                contentService.getAllPublishedMemes()
        );
    }

    @PostMapping("/memes")
    public ResponseEntity<MemePost> createMemePost(
            @RequestBody CreateMemePostRequest request
    ) {

        return ResponseEntity.ok(
                contentService.createMemePost(request)
        );
    }

    @PutMapping("/memes/{memeId}")
    public ResponseEntity<MemePost> updateMemePost(
            @PathVariable Long memeId,
            @RequestBody CreateMemePostRequest request
    ) {

        return ResponseEntity.ok(
                contentService.updateMemePost(
                        memeId,
                        request
                )
        );
    }

    @DeleteMapping("/memes/{memeId}")
    public ResponseEntity<String> deleteMemePost(
            @PathVariable Long memeId
    ) {

        contentService.deleteMemePost(memeId);

        return ResponseEntity.ok(
                "Meme deleted successfully"
        );
    }

    @GetMapping("/meme-candidates")
    public ResponseEntity<List<ContentResponse>> getMemeCandidates() {

        return ResponseEntity.ok(
                contentService.getMemeCandidates()
        );
    }

    @GetMapping("/saved/{authUserId}")
    public ResponseEntity<List<ContentResponse>> getSavedArticles(
            @PathVariable Long authUserId
    ) {

        return ResponseEntity.ok(
                contentService.getSavedArticles(
                        authUserId
                )
        );
    }
    @GetMapping("/comments/{contentId}")
    public ResponseEntity<List<Comment>> getComments(

            @PathVariable Long contentId
    ) {

        return ResponseEntity.ok(
                contentService.getCommentsByContentId(
                        contentId
                )
        );
    }

    @PostMapping("/comments")
    public ResponseEntity<Comment> createComment(

            @RequestBody CreateCommentRequest request
    ) {

        Authentication authentication =

                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        Long authUserId =
                (Long) authentication.getPrincipal();

        request.setAuthUserId(authUserId);

        return ResponseEntity.ok(
                contentService.createComment(request)
        );
    }

    @PutMapping("/admin/{contentId}/remove")
    public ResponseEntity<String> removeContent(
            @PathVariable Long contentId
    ) {

        contentService.removeContent(contentId);

        return ResponseEntity.ok(
                "Content removed successfully"
        );
    }

    @PutMapping("/admin/{contentId}/restore")
    public ResponseEntity<String> restoreContent(
            @PathVariable Long contentId
    ) {

        contentService.restoreContent(contentId);

        return ResponseEntity.ok(
                "Content restored successfully"
        );
    }

    @GetMapping("/admin/removed")
    public ResponseEntity<List<ContentAdminResponse>>
    getRemovedContent() {

        return ResponseEntity.ok(
                contentService.getRemovedContent()
        );
    }
}