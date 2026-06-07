package com.newsplatform.mediaservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long uploadedByUserId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;
    // IMAGE, VIDEO, THUMBNAIL, MEME

    @Column(nullable = false)
    private String mediaCategory;
    // NEWS, USER_UPLOAD, AI_GENERATED, ADMIN_CONTENT

    @Column(nullable = false)
    private String storagePath;

    private String thumbnailPath;

    private Long fileSize;

    @Column(nullable = false)
    private Boolean isCompressed;

    @Column(nullable = false)
    private Boolean isAiGenerated;

    @Column(nullable = false)
    private String status;
    // ACTIVE, DELETED, PROCESSING

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        this.uploadedAt = LocalDateTime.now();

        if (this.isCompressed == null) {
            this.isCompressed = false;
        }

        if (this.isAiGenerated == null) {
            this.isAiGenerated = false;
        }

        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }
}