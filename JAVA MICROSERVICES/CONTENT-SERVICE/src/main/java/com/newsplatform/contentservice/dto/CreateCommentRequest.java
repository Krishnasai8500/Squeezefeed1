package com.newsplatform.contentservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommentRequest {

    private Long contentId;

    private Long authUserId;

    private String username;

    private String commentText;
}