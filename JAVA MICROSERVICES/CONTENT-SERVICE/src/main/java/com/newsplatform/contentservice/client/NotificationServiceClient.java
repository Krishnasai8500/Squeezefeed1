package com.newsplatform.contentservice.client;

import com.newsplatform.contentservice.dto.NotificationRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationServiceClient {

    @PostMapping("/api/notifications")
    void createNotification(
            @RequestBody NotificationRequestDTO request
    );
}
