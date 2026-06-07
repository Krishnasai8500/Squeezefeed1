package com.newsplatform.adminservice.service.impl;

import com.newsplatform.adminservice.dto.AdminActionRequest;
import com.newsplatform.adminservice.dto.AdminActionResponse;
import com.newsplatform.adminservice.entity.AdminAction;
import com.newsplatform.adminservice.repository.AdminActionRepository;
import com.newsplatform.adminservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminActionRepository adminActionRepository;

    @Override
    public AdminActionResponse createAdminAction(AdminActionRequest request) {

        AdminAction action = AdminAction.builder()
                .adminUserId(request.getAdminUserId())
                .adminRole(request.getAdminRole())
                .actionType(request.getActionType())
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .actionDetails(request.getActionDetails())
                .build();

        AdminAction saved = adminActionRepository.save(action);

        return mapToResponse(saved);
    }

    @Override
    public List<AdminActionResponse> getAllAdminActions() {
        return adminActionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AdminActionResponse> getActionsByAdminUser(Long adminUserId) {
        return adminActionRepository.findByAdminUserId(adminUserId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AdminActionResponse> getActionsByType(String actionType) {
        return adminActionRepository.findByActionType(actionType)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AdminActionResponse mapToResponse(AdminAction action) {
        return AdminActionResponse.builder()
                .id(action.getId())
                .adminUserId(action.getAdminUserId())
                .adminRole(action.getAdminRole())
                .actionType(action.getActionType())
                .targetType(action.getTargetType())
                .targetId(action.getTargetId())
                .actionDetails(action.getActionDetails())
                .successful(action.getSuccessful())
                .createdAt(action.getCreatedAt())
                .build();
    }
}