package com.newsplatform.authservice.controller;

import com.newsplatform.authservice.dto.SendOtpRequest;
import com.newsplatform.authservice.dto.VerifyOtpRequest;
import com.newsplatform.authservice.service.EmailOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.newsplatform.authservice.entity.User;
import com.newsplatform.authservice.repository.UserRepository;

@RestController
@RequestMapping("/api/auth/otp")
@RequiredArgsConstructor
public class EmailOtpController {

    private final EmailOtpService emailOtpService;
    private final UserRepository userRepository;

    @PostMapping("/send")
    public ResponseEntity<String> sendOtp(
            @RequestBody
            SendOtpRequest request
    ) {

        emailOtpService.sendOtp(request);

        return ResponseEntity.ok(
                "OTP sent successfully"
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOtp(
            @RequestBody
            VerifyOtpRequest request
    ) {

        boolean verified =
                emailOtpService.verifyOtp(
                        request
                );

        if (!verified) {

            return ResponseEntity.badRequest()
                    .body(
                            "Invalid or expired OTP"
                    );
        }

//        User user =
//                userRepository
//                        .findByEmail(
//                                request.getEmail()
//                        )
//                        .orElseThrow(
//                                () -> new RuntimeException(
//                                        "User not found"
//                                )
//                        );
//
//        user.setIsVerified(true);
//
//        userRepository.save(user);

        return ResponseEntity.ok(
                "OTP verified successfully"
        );
    }
}