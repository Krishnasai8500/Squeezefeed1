package com.newsplatform.contentservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "meme_posts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Punchy meme headline
    @Column(nullable = false)
    private String title;

    // Tiny 1-2 line context
    @Column(length = 500)
    private String shortContext;

    // Uploaded meme image
    @Column(nullable = false)
    private String imageUrl;

    // Link back to original article
    private Long sourceContentId;

    private Float memeabilityScore;

    private Boolean isPublished;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.isPublished == null) {
            this.isPublished = true;
        }
    }
}