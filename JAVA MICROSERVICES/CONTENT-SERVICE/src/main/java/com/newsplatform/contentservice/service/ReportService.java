package com.newsplatform.contentservice.service;

import com.newsplatform.contentservice.dto.ReportRequestDTO;
import com.newsplatform.contentservice.dto.ReportResponseDTO;

import java.util.List;

public interface ReportService {

    ReportResponseDTO createReport(
            Long authUserId,
            ReportRequestDTO request
    );

    List<ReportResponseDTO> getAllReports();
    void deleteReport(Long id);
}