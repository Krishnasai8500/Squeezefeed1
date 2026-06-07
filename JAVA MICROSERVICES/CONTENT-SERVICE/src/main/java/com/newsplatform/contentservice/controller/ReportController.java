package com.newsplatform.contentservice.controller;

import com.newsplatform.contentservice.dto.ReportRequestDTO;
import com.newsplatform.contentservice.dto.ReportResponseDTO;
import com.newsplatform.contentservice.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponseDTO> createReport(
            @RequestHeader("X-Auth-User-Id")
            Long authUserId,

            @Valid
            @RequestBody
            ReportRequestDTO request
    ) {

        return ResponseEntity.ok(
                reportService.createReport(
                        authUserId,
                        request
                )
        );
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ReportResponseDTO>>
    getAllReports() {

        return ResponseEntity.ok(
                reportService.getAllReports()
        );
    }

    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<?> handleIllegalArgument(
            IllegalArgumentException ex
    ) {

        return ResponseEntity
                .status(409)
                .body(
                        Map.of(
                                "message",
                                ex.getMessage()
                        )
                );
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok().build();
    }
}