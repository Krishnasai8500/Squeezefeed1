package com.newsplatform.authservice.service;

import com.newsplatform.authservice.dto.*;
import com.newsplatform.authservice.entity.Role;
import com.newsplatform.authservice.entity.User;
import com.newsplatform.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.newsplatform.authservice.config.JwtService;
import org.springframework.web.client.RestTemplate;
import com.newsplatform.authservice.dto.GoogleLoginRequest;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.UUID;
import com.newsplatform.authservice.service.EmailOtpService;
import com.newsplatform.authservice.dto.SendOtpRequest;
import com.newsplatform.authservice.kafka.KafkaProducerService;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;
    private final KafkaProducerService kafkaProducerService;
    private final EmailOtpService emailOtpService;
//    @Value("${user.service.url}")
//    private String userServiceUrl;

    @Value("${google.client-id}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .userName(request.getUserName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isVerified(true)
                .build();

        User savedUser = userRepository.save(user);
        System.out.println(
                "REGISTER PURPOSE = REGISTRATION"
        );

//        emailOtpService.sendOtp(
//                SendOtpRequest.builder()
//                        .email(
//                                savedUser.getEmail()
//                        )
//                        .purpose(
//                                "REGISTRATION"
//                        )
//                        .build()
//        );

        Map<String, Object> event = new HashMap<>();

        event.put("userId", user.getId());
        event.put("email", user.getEmail());

        kafkaProducerService.publishEvent(
                "user.registered",
                event
        );

        CreateUserProfileRequest profileRequest =
                CreateUserProfileRequest.builder()
                        .authUserId(user.getId())
                        .fullName(user.getFullName())
                        .userName(user.getUserName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .language("ENGLISH")
                        .subscriptionPlan("FREE")
                        .notificationsEnabled(true)
                        .build();
        try {

            restTemplate.postForObject(
//                    userServiceUrl + "/api/users/profile",
                    //localrun
//                    "http://localhost:8082/api/users/profile",
                    "http://user-service:8082/api/users/profile",
                    profileRequest,
                    UserResponse.class
            );



            System.out.println(
                    "PROFILE CREATED SUCCESSFULLY"
            );

        } catch (Exception e) {

            e.printStackTrace();
        }


        String jwtToken = jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getId()
        );

        return AuthResponse.builder()
                .token(jwtToken)
                .email(savedUser.getEmail())
                .userName(savedUser.getUserName())
                .role(savedUser.getRole().name())
                .userId(savedUser.getId())
                .message("Registration successful")
                .build();

    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getIsVerified())) {

            throw new RuntimeException(
                    "Please verify your email before login"
            );
        }

        String jwtToken = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()

        );

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .userName(user.getUserName())
                .role(user.getRole().name())
                .userId(user.getId())
                .message("Login successful")
                .build();
    }

    public AuthResponse googleLogin(
            GoogleLoginRequest request
    ) {

        try {

            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            GsonFactory.getDefaultInstance()
                    )
                            .setAudience(
                                    java.util.Collections.singletonList(
                                            googleClientId
                                    )
                            )
                            .build();

            GoogleIdToken idToken =
                    verifier.verify(
                            request.getCredential()
                    );

            if (idToken == null) {

                throw new RuntimeException(
                        "Invalid Google token"
                );
            }

            GoogleIdToken.Payload payload =
                    idToken.getPayload();

            String email =
                    payload.getEmail();

            String fullName =
                    (String) payload.get("name");

            String providerId =
                    payload.getSubject();



            User user = userRepository
                    .findByEmail(email)
                    .orElse(null);

            if (user != null && user.getUserName() == null) {

                user.setUserName(
                        email.split("@")[0]
                );

                user = userRepository.save(user);
            }
            System.out.println("EMAIL = " + email);
            System.out.println("USERNAME = " + user.getUserName());
            System.out.println("NAME = " + fullName);
            System.out.println("PROVIDER ID = " + providerId);

            if (user == null) {

                String baseUsername =
                        email.split("@")[0];

                String generatedUsername =
                        baseUsername;

                int counter = 1;

                while (
                        userRepository.existsByUserName(
                                generatedUsername
                        )
                ) {
                    generatedUsername =
                            baseUsername + "_" + counter;
                    counter++;
                }

                user = User.builder()
                        .fullName(fullName)
                        .userName(generatedUsername)
                        .email(email)
                        .password(
                                passwordEncoder.encode(
                                        UUID.randomUUID().toString()
                                )
                        )
                        .role(Role.USER)
                        .provider("GOOGLE")
                        .providerId(providerId)
                        .build();

                user = userRepository.save(user);
            }

            String jwtToken = jwtService.generateToken(
                    user.getEmail(),
                    user.getRole().name(),
                    user.getId()
            );

            return AuthResponse.builder()
                    .token(jwtToken)
                    .email(user.getEmail())
                    .userName(user.getUserName())
                    .role(user.getRole().name())
                    .userId(user.getId())
                    .message("Google login successful")
                    .build();



        } catch (Exception e) {

            throw new RuntimeException(
                    e.getMessage()
            );
        }
    }

    public void resetPassword(ResetPasswordRequest request) {

        // OTP was already verified in the /api/auth/otp/verify step.
        // Re-verifying here fails because the OTP is already
        // marked is_used = true in the DB.

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }


}