package com.newsplatform.authservice.service.impl;

import com.newsplatform.authservice.dto.SendOtpRequest;
import com.newsplatform.authservice.dto.VerifyOtpRequest;
import com.newsplatform.authservice.entity.EmailOtp;
import com.newsplatform.authservice.repository.EmailOtpRepository;
import com.newsplatform.authservice.service.EmailOtpService;
import com.newsplatform.authservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailOtpServiceImpl
        implements EmailOtpService {

    private final EmailOtpRepository
            emailOtpRepository;
    private final EmailService
            emailService;
    @Override
    public void sendOtp(
            SendOtpRequest request
    ) {

        System.out.println(
                "SEND OTP PURPOSE = "
                        + request.getPurpose()
        );

        String otp =
                String.valueOf(
                        100000 +
                                new Random()
                                        .nextInt(900000)
                );

        EmailOtp emailOtp =
                EmailOtp.builder()
                        .email(
                                request.getEmail()
                        )
                        .otp(otp)
                        .purpose(
                                request.getPurpose()
                        )
                        .expiresAt(
                                LocalDateTime.now()
                                        .plusMinutes(10)
                        )
                        .isUsed(false)
                        .build();

        emailOtpRepository.save(
                emailOtp
        );

        emailService.sendOtpEmail(
                request.getEmail(),
                otp
        );

        System.out.println(
                "OTP GENERATED: " + otp
        );
    }

    @Override
    public boolean verifyOtp(
            VerifyOtpRequest request
    ) {

        EmailOtp emailOtp =
                emailOtpRepository
                        .findTopByEmailAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(
                                request.getEmail(),
                                request.getPurpose()
                        )
                        .orElse(null);

        if (emailOtp == null) {
            return false;
        }

        if (
                emailOtp.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {
            return false;
        }

        if (
                !emailOtp.getOtp()
                        .equals(
                                request.getOtp()
                        )
        ) {
            return false;
        }

        emailOtp.setIsUsed(true);

        emailOtpRepository.save(
                emailOtp
        );

        return true;
    }
}