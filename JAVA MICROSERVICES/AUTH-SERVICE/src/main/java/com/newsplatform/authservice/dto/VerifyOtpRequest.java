package com.newsplatform.authservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyOtpRequest {

    private String email;

    private String otp;

    private String purpose;
}