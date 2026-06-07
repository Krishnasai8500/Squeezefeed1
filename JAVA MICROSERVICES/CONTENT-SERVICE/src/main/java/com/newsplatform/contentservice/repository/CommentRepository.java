package com.newsplatform.contentservice.repository;

import com.newsplatform.contentservice.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment>
    findByContentIdOrderByCreatedAtDesc(
            Long contentId
    );

}