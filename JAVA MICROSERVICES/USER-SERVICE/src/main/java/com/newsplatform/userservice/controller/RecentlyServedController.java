package com.newsplatform.userservice.controller;

import com.newsplatform.userservice.service.RecentlyServedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/recent-feed")
@RequiredArgsConstructor
public class RecentlyServedController {

    private final RecentlyServedService recentlyServedService;

    @GetMapping("/{authUserId}")
    public ResponseEntity<List<Long>> getRecentlyServedArticles(
            @PathVariable Long authUserId
    ) {

        return ResponseEntity.ok(
                recentlyServedService.getRecentlyServedArticles(authUserId)
        );
    }

    @PostMapping("/{authUserId}")
    public ResponseEntity<Void> saveRecentlyServedArticles(
            @PathVariable Long authUserId,
            @RequestBody List<Long> articleIds
    ) {

        recentlyServedService.saveRecentlyServedArticles(
                authUserId,
                articleIds
        );

        return ResponseEntity.ok().build();
    }
}