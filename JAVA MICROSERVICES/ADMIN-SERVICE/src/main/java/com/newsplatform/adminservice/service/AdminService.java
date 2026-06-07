package com.newsplatform.adminservice.service;

import com.newsplatform.adminservice.dto.AdminActionRequest;
import com.newsplatform.adminservice.dto.AdminActionResponse;

import java.util.List;

public interface AdminService {

    AdminActionResponse createAdminAction(AdminActionRequest request);

    List<AdminActionResponse> getAllAdminActions();

    List<AdminActionResponse> getActionsByAdminUser(Long adminUserId);

    List<AdminActionResponse> getActionsByType(String actionType);
}