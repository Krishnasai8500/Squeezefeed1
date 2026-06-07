package com.newsplatform.notificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;



    @FeignClient(
            name = "USER-SERVICE"
    )
    public interface UserServiceClient {

        @GetMapping(
                "/api/users/preferences/category/{category}"
        )
        List<Long> getUsersByCategory(
                @PathVariable("category")
                String category
        );
    }

