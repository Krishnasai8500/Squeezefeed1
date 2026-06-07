package com.newsplatform.mediaservice.repository;

import com.newsplatform.mediaservice.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {

    List<MediaFile> findByUploadedByUserId(Long userId);

    List<MediaFile> findByMediaCategory(String mediaCategory);

    List<MediaFile> findByFileType(String fileType);

    List<MediaFile> findByStatus(String status);

    List<MediaFile> findByIsAiGenerated(Boolean isAiGenerated);
}