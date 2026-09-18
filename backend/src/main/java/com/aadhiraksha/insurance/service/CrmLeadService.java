package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.*;
import com.aadhiraksha.insurance.model.*;
import com.aadhiraksha.insurance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrmLeadService {

    private final ClientLeadRepository clientLeadRepository;
    private final CallLogRepository callLogRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final ClientMeetingRepository clientMeetingRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final SecureRandom random = new SecureRandom();

    @Transactional
    public ClientLeadDto.LeadResponse createLead(ClientLeadDto.CreateLeadRequest request, User performedBy) {
        String clientCode = "CL-" + (100000 + random.nextInt(900000));

        User assignedAdvisor = null;
        User manager = null;

        if (request.getAssignedAdvisorId() != null) {
            assignedAdvisor = userRepository.findById(request.getAssignedAdvisorId())
                    .orElse(null);
            if (assignedAdvisor != null) {
                manager = assignedAdvisor.getManager();
            }
        } else if (performedBy != null && performedBy.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADVISOR"))) {
            assignedAdvisor = performedBy;
            manager = performedBy.getManager();
        }

        ClientLead lead = ClientLead.builder()
                .clientCode(clientCode)
                .fullName(request.getFullName())
                .companyName(request.getCompanyName())
                .phoneNumber(request.getPhoneNumber())
                .whatsappNumber(request.getWhatsappNumber() != null ? request.getWhatsappNumber() : request.getPhoneNumber())
                .email(request.getEmail())
                .dob(request.getDob())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .insuranceType(request.getInsuranceType() != null ? request.getInsuranceType() : "Health Insurance")
                .existingInsurer(request.getExistingInsurer())
                .policyExpiryDate(request.getPolicyExpiryDate())
                .sumInsured(request.getSumInsured())
                .estimatedPremium(request.getEstimatedPremium())
                .leadSource(request.getLeadSource() != null ? request.getLeadSource() : "DIRECT_ENTRY")
                .stage(request.getStage() != null ? request.getStage() : "NEW_LEAD")
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .assignedAdvisor(assignedAdvisor)
                .manager(manager)
                .notes(request.getNotes())
                .build();

        ClientLead saved = clientLeadRepository.save(lead);

        auditService.logAction("CLIENT_LEAD", saved.getId(), "CREATE", "ALL", null,
                "Created new lead: " + saved.getFullName() + " (" + saved.getClientCode() + ")", performedBy, null);

        return mapToLeadResponse(saved);
    }

    @Transactional
    public ClientLeadDto.LeadResponse updateLead(Long leadId, ClientLeadDto.CreateLeadRequest request, User performedBy) {
        ClientLead lead = clientLeadRepository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with ID: " + leadId));

        String oldStage = lead.getStage();

        if (request.getFullName() != null) lead.setFullName(request.getFullName());
        if (request.getCompanyName() != null) lead.setCompanyName(request.getCompanyName());
        if (request.getPhoneNumber() != null) lead.setPhoneNumber(request.getPhoneNumber());
        if (request.getWhatsappNumber() != null) lead.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getEmail() != null) lead.setEmail(request.getEmail());
        if (request.getDob() != null) lead.setDob(request.getDob());
        if (request.getCity() != null) lead.setCity(request.getCity());
        if (request.getState() != null) lead.setState(request.getState());
        if (request.getPincode() != null) lead.setPincode(request.getPincode());
        if (request.getInsuranceType() != null) lead.setInsuranceType(request.getInsuranceType());
        if (request.getExistingInsurer() != null) lead.setExistingInsurer(request.getExistingInsurer());
        if (request.getPolicyExpiryDate() != null) lead.setPolicyExpiryDate(request.getPolicyExpiryDate());
        if (request.getSumInsured() != null) lead.setSumInsured(request.getSumInsured());
        if (request.getEstimatedPremium() != null) lead.setEstimatedPremium(request.getEstimatedPremium());
        if (request.getStage() != null) lead.setStage(request.getStage());
        if (request.getPriority() != null) lead.setPriority(request.getPriority());
        if (request.getNotes() != null) lead.setNotes(request.getNotes());

        if (request.getAssignedAdvisorId() != null) {
            User advisor = userRepository.findById(request.getAssignedAdvisorId())
                    .orElse(null);
            lead.setAssignedAdvisor(advisor);
            if (advisor != null) {
                lead.setManager(advisor.getManager());
            }
        }

        ClientLead updated = clientLeadRepository.save(lead);

        if (request.getStage() != null && !request.getStage().equals(oldStage)) {
            auditService.logAction("CLIENT_LEAD", updated.getId(), "STATUS_CHANGE", "STAGE", oldStage,
                    updated.getStage(), performedBy, null);
        } else {
            auditService.logAction("CLIENT_LEAD", updated.getId(), "UPDATE", "PROFILE", null,
                    "Updated lead info for " + updated.getFullName(), performedBy, null);
        }

        return mapToLeadResponse(updated);
    }

    @Transactional
    public ClientLeadDto.LeadResponse reassignLead(Long leadId, Long targetAdvisorId, String reason, User performedBy) {
        ClientLead lead = clientLeadRepository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with ID: " + leadId));

        User newAdvisor = userRepository.findById(targetAdvisorId)
                .orElseThrow(() -> new IllegalArgumentException("Advisor not found with ID: " + targetAdvisorId));

        String oldAdvisorName = lead.getAssignedAdvisor() != null ? lead.getAssignedAdvisor().getFullName() : "Unassigned";

        lead.setAssignedAdvisor(newAdvisor);
        lead.setManager(newAdvisor.getManager());
        ClientLead updated = clientLeadRepository.save(lead);

        auditService.logAction("CLIENT_LEAD", updated.getId(), "REASSIGN", "ASSIGNED_ADVISOR",
                oldAdvisorName, newAdvisor.getFullName() + (reason != null ? " (" + reason + ")" : ""), performedBy, null);

        return mapToLeadResponse(updated);
    }

    @Transactional
    public CallLogDto.CallLogResponse logCall(CallLogDto.LogCallRequest request, User advisor) {
        ClientLead client = clientLeadRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        CallLog logEntry = CallLog.builder()
                .client(client)
                .advisor(advisor)
                .callResult(request.getCallResult())
                .callDurationSeconds(request.getCallDurationSeconds() != null ? request.getCallDurationSeconds() : 0)
                .callNotes(request.getCallNotes())
                .nextFollowUpDate(request.getNextFollowUpDate())
                .build();

        CallLog savedLog = callLogRepository.save(logEntry);

        // If next follow-up date is supplied, create a FollowUpTask
        if (request.getNextFollowUpDate() != null) {
            FollowUpTask task = FollowUpTask.builder()
                    .client(client)
                    .advisor(advisor)
                    .scheduledDatetime(request.getNextFollowUpDate())
                    .reminderMilestone("EXACT")
                    .channel("PHONE_CALL")
                    .status("PENDING")
                    .notes("Follow-up scheduled from call log: " + (request.getCallNotes() != null ? request.getCallNotes() : ""))
                    .build();
            followUpTaskRepository.save(task);
        }

        // Update lead stage if requested
        if (request.getUpdateStageTo() != null && !request.getUpdateStageTo().trim().isEmpty()) {
            String oldStage = client.getStage();
            client.setStage(request.getUpdateStageTo());
            clientLeadRepository.save(client);
            auditService.logAction("CLIENT_LEAD", client.getId(), "STATUS_CHANGE", "STAGE", oldStage, request.getUpdateStageTo(), advisor, null);
        }

        auditService.logAction("CLIENT_LEAD", client.getId(), "CALL_LOG", "CALL_RESULT", null,
                "Call Result: " + request.getCallResult() + " | Notes: " + request.getCallNotes(), advisor, null);

        return CallLogDto.CallLogResponse.builder()
                .id(savedLog.getId())
                .clientId(client.getId())
                .clientName(client.getFullName())
                .clientPhone(client.getPhoneNumber())
                .advisorId(advisor.getId())
                .advisorName(advisor.getFullName())
                .callResult(savedLog.getCallResult())
                .callDurationSeconds(savedLog.getCallDurationSeconds())
                .callNotes(savedLog.getCallNotes())
                .nextFollowUpDate(savedLog.getNextFollowUpDate())
                .createdAt(savedLog.getCreatedAt())
                .build();
    }

    @Transactional
    public MeetingDto.MeetingResponse scheduleMeeting(MeetingDto.ScheduleMeetingRequest request, User advisor) {
        ClientLead client = clientLeadRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        String meetCode = "adh-" + UUID.randomUUID().toString().substring(0, 4) + "-" + UUID.randomUUID().toString().substring(0, 3);
        String googleMeetUrl = "https://meet.google.com/" + meetCode;

        LocalDateTime endDatetime = request.getEndDatetime() != null
                ? request.getEndDatetime()
                : request.getMeetingDatetime().plusMinutes(30);

        ClientMeeting meeting = ClientMeeting.builder()
                .client(client)
                .advisor(advisor)
                .title(request.getTitle() != null ? request.getTitle() : "Insurance Consultation with " + client.getFullName())
                .purpose(request.getPurpose())
                .product(request.getProduct() != null ? request.getProduct() : client.getInsuranceType())
                .meetingDatetime(request.getMeetingDatetime())
                .endDatetime(endDatetime)
                .googleMeetUrl(request.getMeetingType() == null || request.getMeetingType().equals("GOOGLE_MEET") ? googleMeetUrl : null)
                .meetingType(request.getMeetingType() != null ? request.getMeetingType() : "GOOGLE_MEET")
                .location(request.getLocation())
                .status("SCHEDULED")
                .outcomeNotes(request.getNotes())
                .build();

        ClientMeeting saved = clientMeetingRepository.save(meeting);

        // Advance client stage to MEETING if currently at earlier stage
        if ("NEW_LEAD".equals(client.getStage()) || "CONTACTED".equals(client.getStage()) || "FOLLOWUP".equals(client.getStage())) {
            client.setStage("MEETING");
            clientLeadRepository.save(client);
        }

        auditService.logAction("CLIENT_LEAD", client.getId(), "MEETING_SCHEDULED", "MEETING", null,
                "Scheduled meeting: " + meeting.getTitle() + " at " + meeting.getMeetingDatetime(), advisor, null);

        return mapToMeetingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClientLeadDto.LeadResponse> getLeadsForUser(User user) {
        boolean isSuperAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<ClientLead> leads;
        if (isSuperAdmin) {
            leads = clientLeadRepository.findAll();
        } else if (isManager) {
            leads = clientLeadRepository.findByManagerIdOrderByUpdatedAtDesc(user.getId());
        } else {
            leads = clientLeadRepository.findByAssignedAdvisorIdOrderByUpdatedAtDesc(user.getId());
        }

        return leads.stream().map(this::mapToLeadResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto.FollowUpResponse> getDueTodayFollowUps(User user) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<FollowUpTask> tasks = followUpTaskRepository.findDueTodayForAdvisor(user.getId(), startOfDay, endOfDay);
        return tasks.stream().map(this::mapToFollowUpResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto.FollowUpResponse> getOverdueFollowUps(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<FollowUpTask> tasks = followUpTaskRepository.findOverdueForAdvisor(user.getId(), now);
        return tasks.stream().map(this::mapToFollowUpResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDto.MeetingResponse> getUpcomingMeetings(User user) {
        LocalDateTime start = LocalDateTime.now().minusHours(1);
        LocalDateTime end = LocalDateTime.now().plusDays(30);

        List<ClientMeeting> meetings = clientMeetingRepository.findMeetingsForAdvisorBetween(user.getId(), start, end);
        return meetings.stream().map(this::mapToMeetingResponse).collect(Collectors.toList());
    }

    public ClientLeadDto.LeadResponse mapToLeadResponse(ClientLead lead) {
        return ClientLeadDto.LeadResponse.builder()
                .id(lead.getId())
                .clientCode(lead.getClientCode())
                .fullName(lead.getFullName())
                .companyName(lead.getCompanyName())
                .phoneNumber(lead.getPhoneNumber())
                .whatsappNumber(lead.getWhatsappNumber())
                .email(lead.getEmail())
                .dob(lead.getDob())
                .city(lead.getCity())
                .state(lead.getState())
                .pincode(lead.getPincode())
                .insuranceType(lead.getInsuranceType())
                .existingInsurer(lead.getExistingInsurer())
                .policyExpiryDate(lead.getPolicyExpiryDate())
                .sumInsured(lead.getSumInsured())
                .estimatedPremium(lead.getEstimatedPremium())
                .leadSource(lead.getLeadSource())
                .stage(lead.getStage())
                .priority(lead.getPriority())
                .assignedAdvisorId(lead.getAssignedAdvisor() != null ? lead.getAssignedAdvisor().getId() : null)
                .assignedAdvisorName(lead.getAssignedAdvisor() != null ? lead.getAssignedAdvisor().getFullName() : "Unassigned")
                .managerId(lead.getManager() != null ? lead.getManager().getId() : null)
                .managerName(lead.getManager() != null ? lead.getManager().getFullName() : "None")
                .notes(lead.getNotes())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }

    public FollowUpDto.FollowUpResponse mapToFollowUpResponse(FollowUpTask task) {
        boolean isOverdue = task.getScheduledDatetime().isBefore(LocalDateTime.now()) && "PENDING".equals(task.getStatus());

        return FollowUpDto.FollowUpResponse.builder()
                .id(task.getId())
                .clientId(task.getClient().getId())
                .clientCode(task.getClient().getClientCode())
                .clientName(task.getClient().getFullName())
                .clientPhone(task.getClient().getPhoneNumber())
                .insuranceType(task.getClient().getInsuranceType())
                .advisorId(task.getAdvisor().getId())
                .advisorName(task.getAdvisor().getFullName())
                .scheduledDatetime(task.getScheduledDatetime())
                .reminderMilestone(task.getReminderMilestone())
                .channel(task.getChannel())
                .status(task.getStatus())
                .notes(task.getNotes())
                .isOverdue(isOverdue)
                .createdAt(task.getCreatedAt())
                .completedAt(task.getCompletedAt())
                .build();
    }

    public MeetingDto.MeetingResponse mapToMeetingResponse(ClientMeeting meeting) {
        return MeetingDto.MeetingResponse.builder()
                .id(meeting.getId())
                .clientId(meeting.getClient().getId())
                .clientName(meeting.getClient().getFullName())
                .clientEmail(meeting.getClient().getEmail())
                .clientPhone(meeting.getClient().getPhoneNumber())
                .advisorId(meeting.getAdvisor().getId())
                .advisorName(meeting.getAdvisor().getFullName())
                .title(meeting.getTitle())
                .purpose(meeting.getPurpose())
                .product(meeting.getProduct())
                .meetingDatetime(meeting.getMeetingDatetime())
                .endDatetime(meeting.getEndDatetime())
                .googleMeetUrl(meeting.getGoogleMeetUrl())
                .googleCalendarEventId(meeting.getGoogleCalendarEventId())
                .meetingType(meeting.getMeetingType())
                .location(meeting.getLocation())
                .status(meeting.getStatus())
                .outcomeNotes(meeting.getOutcomeNotes())
                .createdAt(meeting.getCreatedAt())
                .build();
    }
}
