package com.newsplatform.adminservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_actions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long adminUserId;

    @Enumerated(EnumType.STRING)
    private AdminRole adminRole;

    @Column(nullable = false)
    private String actionType;

    @Column(nullable = false)
    private String targetType;

    private Long targetId;

    @Column(columnDefinition = "TEXT")
    private String actionDetails;

    private Boolean successful;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.successful = true;
    }
}