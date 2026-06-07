package com.newsplatform.notificationservice.service;

import com.newsplatform.notificationservice.dto.NotificationRequestDTO;
import com.newsplatform.notificationservice.dto.NotificationResponseDTO;

import java.util.List;

public interface NotificationService {

    NotificationResponseDTO createNotification(NotificationRequestDTO requestDTO);

    List<NotificationResponseDTO> getUserNotifications(Long userId);

    List<NotificationResponseDTO> getUnreadNotifications(Long userId);

    NotificationResponseDTO markAsRead(Long notificationId);

    List<NotificationResponseDTO> getNotificationsByStatus(String status);

    List<NotificationResponseDTO> getNotificationsByType(String type);

    void deleteNotification(
            Long notificationId
    );
}