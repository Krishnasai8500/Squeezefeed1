package com.newsplatform.notificationservice.repository;

import com.newsplatform.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndIsReadFalse(Long userId);

    List<Notification> findByStatus(String status);

    List<Notification> findByType(String type);

    List<Notification> findByUserIdOrderByCreatedAtAsc(
            Long userId
    );

}