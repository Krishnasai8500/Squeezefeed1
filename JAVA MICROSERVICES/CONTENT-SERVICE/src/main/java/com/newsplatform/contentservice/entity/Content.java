package com.newsplatform.contentservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.*;
@Entity
@Table(name = "contents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String fullContent;

    @Column(length = 1500)
    private String summary;



    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "content_translated_titles",
            joinColumns = @JoinColumn(name = "content_id")
    )
    @MapKeyColumn(name = "language_code")
    @Column(name = "translated_title", columnDefinition = "TEXT")
    private Map<String, String> translatedTitle;


    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "content_translated_summaries",
            joinColumns = @JoinColumn(name = "content_id")
    )
    @MapKeyColumn(name = "language_code")
    @Column(name = "translated_summary", columnDefinition = "TEXT")
    private Map<String, String> translatedSummary;

    private String author;

    private String sourceUrl;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    private Language language;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "content_tags",
            joinColumns = @JoinColumn(name = "content_id")
    )
    @Column(name = "tag")
    private List<String> tags;

    private String imageUrl;

    private Boolean isPublished;

    private Boolean isTrending;

    private LocalDateTime publishedAt;

    private Long viewCount;

    private Long shareCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String articleCity;

    private String articleState;

    private LocalDateTime removedAt;

    private Boolean isRemoved = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean memeCreated = false;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.viewCount = 0L;
        this.shareCount = 0L;

        // ✅ Only set defaults if not already set by builder
        if (this.isPublished == null) this.isPublished = false;
        if (this.isTrending == null) this.isTrending = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}