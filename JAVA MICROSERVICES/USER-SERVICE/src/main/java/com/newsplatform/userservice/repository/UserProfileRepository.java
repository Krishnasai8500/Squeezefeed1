package com.newsplatform.userservice.repository;

import com.newsplatform.userservice.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.*;
import org.springframework.data.jpa.repository.Query;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByAuthUserId(Long authUserId);

    Optional<UserProfile> findByEmail(String email);

    Optional<UserProfile>
    findByUserName(String userName);

    List<UserProfile>
    findByUserNameContainingIgnoreCase(
            String userName
    );

    boolean existsByEmail(String email);

    boolean existsByAuthUserId(Long authUserId);

    @Query("""
       SELECT DISTINCT u
       FROM UserProfile u
       JOIN u.preferredCategories c
       WHERE c = :category
       AND u.notificationsEnabled = true
       """)
    List<UserProfile> findUsersByCategory(
            @Param("category") String category
    );

}