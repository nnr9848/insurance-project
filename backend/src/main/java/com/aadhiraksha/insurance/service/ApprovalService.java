package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.ApprovalDto;
import com.aadhiraksha.insurance.model.ApprovalRequest;
import com.aadhiraksha.insurance.model.ClientLead;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ApprovalRequestRepository;
import com.aadhiraksha.insurance.repository.ClientLeadRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final ClientLeadRepository clientLeadRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public ApprovalDto.Response submitApprovalRequest(ApprovalDto.SubmitRequest request, String userEmail) {
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        ClientLead client = null;
        if (request.getClientId() != null) {
            client = clientLeadRepository.findById(request.getClientId()).orElse(null);
        }

        User targetAdvisor = null;
        if (request.getTargetAdvisorId() != null) {
            targetAdvisor = userRepository.findById(request.getTargetAdvisorId()).orElse(null);
        }

        User manager = requester.getManager();

        ApprovalRequest approval = ApprovalRequest.builder()
                .requestType(request.getRequestType())
                .client(client)
                .requestedBy(requester)
                .manager(manager)
                .currentValue(request.getCurrentValue())
                .proposedValue(request.getProposedValue())
                .discountPercent(request.getDiscountPercent())
                .targetAdvisor(targetAdvisor)
                .status("PENDING")
                .reason(request.getReason())
                .build();

        ApprovalRequest saved = approvalRequestRepository.save(approval);

        // Audit Trail Record
        auditService.logAction(
                "ApprovalRequest",
                saved.getId(),
                "CREATE",
                "Approval Submitted",
                null,
                "Submitted " + saved.getRequestType() + " request for review. Reason: " + saved.getReason(),
                requester,
                null
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ApprovalDto.Response> getApprovals(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isSuperAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<ApprovalRequest> list;
        if (isSuperAdmin) {
            list = approvalRequestRepository.findAllByOrderByCreatedAtDesc();
        } else if (isManager) {
            list = approvalRequestRepository.findByManagerIdOrderByCreatedAtDesc(user.getId());
        } else {
            list = approvalRequestRepository.findByRequestedByIdOrderByCreatedAtDesc(user.getId());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApprovalDto.Response> getClientApprovals(Long clientId) {
        return approvalRequestRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApprovalDto.Response reviewApproval(Long approvalId, ApprovalDto.ReviewRequest request, String managerEmail) {
        ApprovalRequest approval = approvalRequestRepository.findById(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("Approval request not found with ID: " + approvalId));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + managerEmail));

        String oldStatus = approval.getStatus();
        approval.setStatus(request.getStatus());
        approval.setManager(manager);
        approval.setManagerReviewNotes(request.getReviewNotes());
        approval.setReviewedAt(LocalDateTime.now());

        ApprovalRequest saved = approvalRequestRepository.save(approval);

        // If approved and is a lead reassignment, apply the reassignment directly
        if ("APPROVED".equals(request.getStatus()) && "LEAD_REASSIGNMENT".equals(approval.getRequestType()) && approval.getClient() != null && approval.getTargetAdvisor() != null) {
            ClientLead client = approval.getClient();
            client.setAssignedAdvisor(approval.getTargetAdvisor());
            client.setManager(approval.getTargetAdvisor().getManager());
            clientLeadRepository.save(client);
        }

        // Audit Trail
        auditService.logAction(
                "ApprovalRequest",
                saved.getId(),
                "UPDATE",
                "approval_status",
                oldStatus,
                request.getStatus() + (request.getReviewNotes() != null ? " - Notes: " + request.getReviewNotes() : ""),
                manager,
                null
        );

        return mapToResponse(saved);
    }

    private ApprovalDto.Response mapToResponse(ApprovalRequest a) {
        return ApprovalDto.Response.builder()
                .id(a.getId())
                .requestType(a.getRequestType())
                .clientId(a.getClient() != null ? a.getClient().getId() : null)
                .clientName(a.getClient() != null ? a.getClient().getFullName() : "N/A")
                .clientPhone(a.getClient() != null ? a.getClient().getPhoneNumber() : "")
                .requestedById(a.getRequestedBy() != null ? a.getRequestedBy().getId() : null)
                .requestedByName(a.getRequestedBy() != null ? a.getRequestedBy().getFullName() : "System")
                .managerId(a.getManager() != null ? a.getManager().getId() : null)
                .managerName(a.getManager() != null ? a.getManager().getFullName() : "Branch Management")
                .currentValue(a.getCurrentValue())
                .proposedValue(a.getProposedValue())
                .discountPercent(a.getDiscountPercent())
                .targetAdvisorId(a.getTargetAdvisor() != null ? a.getTargetAdvisor().getId() : null)
                .targetAdvisorName(a.getTargetAdvisor() != null ? a.getTargetAdvisor().getFullName() : null)
                .status(a.getStatus())
                .reason(a.getReason())
                .managerReviewNotes(a.getManagerReviewNotes())
                .reviewedAt(a.getReviewedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
