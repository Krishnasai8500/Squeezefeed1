package com.newsplatform.notificationservice.service.impl;

import com.newsplatform.notificationservice.dto.NotificationRequestDTO;
import com.newsplatform.notificationservice.dto.NotificationResponseDTO;
import com.newsplatform.notificationservice.entity.Notification;
import com.newsplatform.notificationservice.repository.NotificationRepository;
import com.newsplatform.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationResponseDTO createNotification(NotificationRequestDTO requestDTO) {

        List<Notification> existing =
                notificationRepository
                        .findByUserIdOrderByCreatedAtAsc(
                                requestDTO.getUserId()
                        );

        if (existing.size() >= 20) {

            notificationRepository.delete(
                    existing.get(0)
            );
        }

        Notification notification = Notification.builder()
                .userId(requestDTO.getUserId())
                .title(requestDTO.getTitle())
                .message(requestDTO.getMessage())
                .type(requestDTO.getType())
                .deliveryChannel(requestDTO.getDeliveryChannel())
                .scheduledAt(requestDTO.getScheduledAt())
                .contentId(
                        requestDTO.getContentId()
                )
                .status("PENDING")
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        return mapToDTO(saved);
    }

    @Override
    public List<NotificationResponseDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<NotificationResponseDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public NotificationResponseDTO markAsRead(Long notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        notification.setStatus("SENT");
        notification.setSentAt(LocalDateTime.now());

        Notification updated = notificationRepository.save(notification);

        return mapToDTO(updated);
    }

    @Override
    public List<NotificationResponseDTO> getNotificationsByStatus(String status) {
        return notificationRepository.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<NotificationResponseDTO> getNotificationsByType(String type) {
        return notificationRepository.findByType(type)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private NotificationResponseDTO mapToDTO(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .deliveryChannel(notification.getDeliveryChannel())
                .status(notification.getStatus())
                .isRead(notification.getIsRead())
                .scheduledAt(notification.getScheduledAt())
                .sentAt(notification.getSentAt())
                .createdAt(notification.getCreatedAt())
                .contentId(
                        notification.getContentId()
                )
                .build();
    }

    @Override
    public void deleteNotification(
            Long notificationId
    ) {

        notificationRepository.deleteById(
                notificationId
        );
    }


}