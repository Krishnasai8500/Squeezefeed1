package com.newsplatform.contentservice.repository;

import com.newsplatform.contentservice.entity.MemePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemePostRepository
        extends JpaRepository<MemePost, Long> {

    List<MemePost>
    findByIsPublishedTrueOrderByCreatedAtDesc();
}