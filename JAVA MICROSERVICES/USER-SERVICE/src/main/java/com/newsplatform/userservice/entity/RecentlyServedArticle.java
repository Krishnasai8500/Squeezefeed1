package com.newsplatform.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recently_served_articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentlyServedArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long authUserId;

    private Long contentId;

    private LocalDateTime servedAt;

    @PrePersist
    public void prePersist() {
        servedAt = LocalDateTime.now();
    }
}