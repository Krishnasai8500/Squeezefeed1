package com.newsplatform.mediaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MediaUploadRequestDTO {

    @NotNull
    private Long uploadedByUserId;

    @NotBlank
    private String fileType;

    @NotBlank
    private String mediaCategory;

    private Boolean isAiGenerated;
}