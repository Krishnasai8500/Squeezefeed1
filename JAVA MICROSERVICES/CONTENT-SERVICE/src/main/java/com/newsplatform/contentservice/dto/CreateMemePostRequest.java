package com.newsplatform.contentservice.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMemePostRequest {

    private String title;

    private String shortContext;

    private String imageUrl;

    private Long sourceContentId;

    private Float memeabilityScore;
}