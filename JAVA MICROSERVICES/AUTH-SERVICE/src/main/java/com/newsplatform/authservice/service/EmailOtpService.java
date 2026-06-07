package com.newsplatform.authservice.service;

import com.newsplatform.authservice.dto.SendOtpRequest;
import com.newsplatform.authservice.dto.VerifyOtpRequest;

public interface EmailOtpService {

    void sendOtp(
            SendOtpRequest request
    );

    boolean verifyOtp(
            VerifyOtpRequest request
    );
}