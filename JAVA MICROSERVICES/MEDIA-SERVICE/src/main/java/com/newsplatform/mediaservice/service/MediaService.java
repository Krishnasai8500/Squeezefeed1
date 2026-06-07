package com.newsplatform.mediaservice.service;

import com.newsplatform.mediaservice.dto.MediaResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {

    MediaResponseDTO uploadMedia(
            MultipartFile file,
            Long uploadedByUserId,
            String fileType,
            String mediaCategory,
            Boolean isAiGenerated
    );

    List<MediaResponseDTO> getUserMedia(Long userId);

    List<MediaResponseDTO> getMediaByCategory(String category);

    List<MediaResponseDTO> getMediaByType(String type);

    List<MediaResponseDTO> getAiGeneratedMedia();

    MediaResponseDTO deleteMedia(Long mediaId);
}