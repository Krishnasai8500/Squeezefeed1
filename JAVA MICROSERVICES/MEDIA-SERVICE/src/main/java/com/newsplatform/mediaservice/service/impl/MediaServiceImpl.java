package com.newsplatform.mediaservice.service.impl;

import com.newsplatform.mediaservice.dto.MediaResponseDTO;
import com.newsplatform.mediaservice.entity.MediaFile;
import com.newsplatform.mediaservice.repository.MediaFileRepository;
import com.newsplatform.mediaservice.service.MediaService;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final MediaFileRepository mediaFileRepository;

    @Value("${media.upload-dir}")
    private String UPLOAD_DIR;

    @Override
    public MediaResponseDTO uploadMedia(
            MultipartFile file,
            Long uploadedByUserId,
            String fileType,
            String mediaCategory,
            Boolean isAiGenerated
    ) {

        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String extension = "";

            String originalName = file.getOriginalFilename();

            if (
                    originalName != null &&
                            originalName.contains(".")
            ) {
                extension = originalName.substring(
                        originalName.lastIndexOf(".")
                );
            }

            String uniqueFileName =
                    UUID.randomUUID() + ".webp";

            String filePath =
                    UPLOAD_DIR + uniqueFileName;

            File destinationFile =
                    new File(filePath);

            BufferedImage image =
                    Thumbnails.of(file.getInputStream())
                            .size(1080, 1920)
                            .asBufferedImage();

            ImageIO.write(
                    image,
                    "webp",
                    destinationFile
            );


            MediaFile mediaFile = MediaFile.builder()
                    .uploadedByUserId(uploadedByUserId)
                    .fileName(uniqueFileName)
                    .fileType(fileType)
                    .mediaCategory(mediaCategory)
                    .storagePath(filePath)
                    .fileSize(destinationFile.length()) // IMPORTANT
                    .isCompressed(true)                 // IMPORTANT
                    .isAiGenerated(isAiGenerated != null && isAiGenerated)
                    .status("ACTIVE")
                    .build();

            MediaFile saved = mediaFileRepository.save(mediaFile);

            return mapToDTO(saved);

        } catch (IOException e) {
            throw new RuntimeException("Media upload failed: " + e.getMessage());
        }
    }

    @Override
    public List<MediaResponseDTO> getUserMedia(Long userId) {
        return mediaFileRepository.findByUploadedByUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<MediaResponseDTO> getMediaByCategory(String category) {
        return mediaFileRepository.findByMediaCategory(category)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<MediaResponseDTO> getMediaByType(String type) {
        return mediaFileRepository.findByFileType(type)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<MediaResponseDTO> getAiGeneratedMedia() {
        return mediaFileRepository.findByIsAiGenerated(true)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public MediaResponseDTO deleteMedia(Long mediaId) {

        MediaFile mediaFile = mediaFileRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        mediaFile.setStatus("DELETED");

        MediaFile updated = mediaFileRepository.save(mediaFile);

        return mapToDTO(updated);
    }

    private MediaResponseDTO mapToDTO(MediaFile mediaFile) {
        return MediaResponseDTO.builder()
                .id(mediaFile.getId())
                .uploadedByUserId(mediaFile.getUploadedByUserId())
                .fileName(mediaFile.getFileName())
                .fileType(mediaFile.getFileType())
                .mediaCategory(mediaFile.getMediaCategory())
                .storagePath(mediaFile.getStoragePath())
                .thumbnailPath(mediaFile.getThumbnailPath())
                .fileSize(mediaFile.getFileSize())
                .isCompressed(mediaFile.getIsCompressed())
                .isAiGenerated(mediaFile.getIsAiGenerated())
                .status(mediaFile.getStatus())
                .uploadedAt(mediaFile.getUploadedAt())
                .build();
    }
}