package com.newsplatform.adminservice.controller;

import com.newsplatform.adminservice.dto.AdminActionRequest;
import com.newsplatform.adminservice.dto.AdminActionResponse;
import com.newsplatform.adminservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/action")
    public ResponseEntity<AdminActionResponse> createAdminAction(
            @Valid @RequestBody AdminActionRequest request
    ) {
        return ResponseEntity.ok(
                adminService.createAdminAction(request)
        );
    }

    @GetMapping("/actions")
    public ResponseEntity<List<AdminActionResponse>> getAllActions() {
        return ResponseEntity.ok(
                adminService.getAllAdminActions()
        );
    }

    @GetMapping("/actions/admin/{adminUserId}")
    public ResponseEntity<List<AdminActionResponse>> getActionsByAdmin(
            @PathVariable Long adminUserId
    ) {
        return ResponseEntity.ok(
                adminService.getActionsByAdminUser(adminUserId)
        );
    }

    @GetMapping("/actions/type/{actionType}")
    public ResponseEntity<List<AdminActionResponse>> getActionsByType(
            @PathVariable String actionType
    ) {
        return ResponseEntity.ok(
                adminService.getActionsByType(actionType)
        );
    }
}