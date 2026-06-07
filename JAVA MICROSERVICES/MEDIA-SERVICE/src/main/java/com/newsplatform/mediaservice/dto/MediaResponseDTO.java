package com.newsplatform.mediaservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MediaResponseDTO {

    private Long id;
    private Long uploadedByUserId;
    private String fileName;
    private String fileType;
    private String mediaCategory;
    private String storagePath;
    private String thumbnailPath;
    private Long fileSize;
    private Boolean isCompressed;
    private Boolean isAiGenerated;
    private String status;
    private LocalDateTime uploadedAt;
}