package com.newsplatform.adminservice.repository;

import com.newsplatform.adminservice.entity.AdminAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminActionRepository extends JpaRepository<AdminAction, Long> {

    List<AdminAction> findByAdminUserId(Long adminUserId);

    List<AdminAction> findByActionType(String actionType);

    List<AdminAction> findByTargetType(String targetType);
}