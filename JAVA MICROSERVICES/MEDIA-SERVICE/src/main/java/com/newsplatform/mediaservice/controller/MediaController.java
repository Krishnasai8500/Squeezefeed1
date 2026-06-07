package com.newsplatform.mediaservice.controller;

import com.newsplatform.mediaservice.dto.MediaResponseDTO;
import com.newsplatform.mediaservice.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<MediaResponseDTO> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long uploadedByUserId,
            @RequestParam String fileType,
            @RequestParam String mediaCategory,
            @RequestParam(required = false, defaultValue = "false") Boolean isAiGenerated
    ) {

        return ResponseEntity.ok(
                mediaService.uploadMedia(
                        file,
                        uploadedByUserId,
                        fileType,
                        mediaCategory,
                        isAiGenerated
                )
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MediaResponseDTO>> getUserMedia(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                mediaService.getUserMedia(userId)
        );
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MediaResponseDTO>> getByCategory(
            @PathVariable String category
    ) {

        return ResponseEntity.ok(
                mediaService.getMediaByCategory(category)
        );
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<MediaResponseDTO>> getByType(
            @PathVariable String type
    ) {

        return ResponseEntity.ok(
                mediaService.getMediaByType(type)
        );
    }

    @GetMapping("/ai-generated")
    public ResponseEntity<List<MediaResponseDTO>> getAiGeneratedMedia() {

        return ResponseEntity.ok(
                mediaService.getAiGeneratedMedia()
        );
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<MediaResponseDTO> deleteMedia(
            @PathVariable Long mediaId
    ) {

        return ResponseEntity.ok(
                mediaService.deleteMedia(mediaId)
        );
    }
}