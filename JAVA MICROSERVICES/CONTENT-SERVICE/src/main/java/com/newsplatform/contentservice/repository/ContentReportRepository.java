package com.newsplatform.contentservice.repository;

import com.newsplatform.contentservice.entity.ContentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentReportRepository
        extends JpaRepository<ContentReport, Long> {

    boolean existsByContentIdAndReportedByUserId(
            Long contentId,
            Long reportedByUserId
    );


}