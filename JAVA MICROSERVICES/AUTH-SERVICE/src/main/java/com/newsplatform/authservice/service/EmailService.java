package com.newsplatform.authservice.service;

public interface EmailService {

    void sendOtpEmail(
            String email,
            String otp
    );
}