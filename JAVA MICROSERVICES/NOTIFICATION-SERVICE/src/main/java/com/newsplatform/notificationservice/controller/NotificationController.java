package com.newsplatform.notificationservice.controller;

import com.newsplatform.notificationservice.dto.NotificationRequestDTO;
import com.newsplatform.notificationservice.dto.NotificationResponseDTO;
import com.newsplatform.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponseDTO> createNotification(
            @Valid @RequestBody NotificationRequestDTO requestDTO) {

        return ResponseEntity.ok(
                notificationService.createNotification(requestDTO)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDTO>> getUserNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
            @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<NotificationResponseDTO>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                notificationService.getNotificationsByStatus(status)
        );
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<NotificationResponseDTO>> getByType(
            @PathVariable String type) {

        return ResponseEntity.ok(
                notificationService.getNotificationsByType(type)
        );
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId
    ) {

        notificationService.deleteNotification(
                notificationId
        );

        return ResponseEntity.noContent().build();
    }
}