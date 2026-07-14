package com.newsplatform.userservice.repository;

import com.newsplatform.userservice.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import com.newsplatform.userservice.entity.FeedbackStatus;
import java.util.List;


public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByStatusOrderByCreatedAtDesc(FeedbackStatus status);
}

