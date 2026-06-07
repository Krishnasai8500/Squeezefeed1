package com.newsplatform.contentservice.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long authUserId;

    private List<Long> savedArticleIds;

    private String city;

    private String state;

    private String country;

    private List<String> preferredCategories;
}