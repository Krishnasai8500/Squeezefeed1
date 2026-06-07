package com.newsplatform.contentservice.service.impl;

import com.newsplatform.contentservice.dto.ReportRequestDTO;
import com.newsplatform.contentservice.dto.ReportResponseDTO;
import com.newsplatform.contentservice.entity.ContentReport;
import com.newsplatform.contentservice.repository.ContentReportRepository;
import com.newsplatform.contentservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ContentReportRepository reportRepository;

    @Override
    public ReportResponseDTO createReport(
            Long authUserId,
            ReportRequestDTO request
    ) {

        boolean alreadyReported =
                reportRepository
                        .existsByContentIdAndReportedByUserId(
                                request.getContentId(),
                                authUserId
                        );

        if (alreadyReported) {

            throw new IllegalArgumentException(
                    "You already reported this article"
            );
        }

        ContentReport report =
                ContentReport.builder()
                        .contentId(
                                request.getContentId()
                        )
                        .reportedByUserId(
                                authUserId
                        )
                        .reason(
                                request.getReason()
                        )
                        .description(
                                request.getDescription()
                        )
                        .status("PENDING")
                        .build();

        ContentReport saved =
                reportRepository.save(report);

        return mapToResponse(saved);
    }

    @Override
    public List<ReportResponseDTO> getAllReports() {

        return reportRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ReportResponseDTO mapToResponse(
            ContentReport report
    ) {

        return ReportResponseDTO.builder()
                .id(report.getId())
                .contentId(report.getContentId())
                .reportedByUserId(
                        report.getReportedByUserId()
                )
                .reason(report.getReason())
                .description(
                        report.getDescription()
                )
                .status(report.getStatus())
                .createdAt(
                        report.getCreatedAt()
                )
                .build();
    }

    @Override
    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}