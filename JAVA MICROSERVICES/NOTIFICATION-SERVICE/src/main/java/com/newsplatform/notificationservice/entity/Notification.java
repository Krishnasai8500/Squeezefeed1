package com.newsplatform.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long contentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 5000)
    private String message;

    @Column(nullable = false)
    private String type;
    // BREAKING_NEWS, PREMIUM_UPSELL, SYSTEM_ALERT, PERSONALIZED

    @Column(nullable = false)
    private String deliveryChannel;
    // EMAIL, PUSH, SMS, IN_APP

    @Column(nullable = false)
    private String status;
    // PENDING, SENT, FAILED

    private Boolean isRead;

    private LocalDateTime scheduledAt;

    private LocalDateTime sentAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}