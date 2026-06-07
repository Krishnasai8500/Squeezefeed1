package com.newsplatform.newsorchestrationservice.repository;

import com.newsplatform.newsorchestrationservice.entity.ProcessedStoryFingerprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface
ProcessedStoryFingerprintRepository
        extends JpaRepository<
                ProcessedStoryFingerprint,
                Long
                > {

    boolean existsByFingerprintAndCreatedAtAfter(
            String fingerprint,
            LocalDateTime time
    );

    void deleteByCreatedAtBefore(
            LocalDateTime time
    );
    boolean existsByFingerprint(String fingerprint);
}
