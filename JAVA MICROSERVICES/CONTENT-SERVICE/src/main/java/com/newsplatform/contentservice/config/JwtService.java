package com.newsplatform.contentservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;

@Service
public class JwtService {

    // SAME secret key used in auth-service
    private static final String SECRET_KEY =
            "your-256-bit-secret-key-your-256-bit-secret-key";

    public Long extractUserId(String token) {

        Claims claims = extractAllClaims(token);

        return claims.get(
                "userId",
                Long.class
        );
    }

    private Claims extractAllClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }

    private Key getSignKey() {

        byte[] keyBytes =
                SECRET_KEY.getBytes();

        return Keys.hmacShaKeyFor(keyBytes);
    }
}