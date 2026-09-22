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
public class CrmClientService {

    private final ClientRepository clientRepository;
    private final ClientOpportunityRepository clientOpportunityRepository;
    private final QuoteInquiryRepository quoteInquiryRepository;
    private final CallLogRepository callLogRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final ClientMeetingRepository clientMeetingRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final SecureRandom random = new SecureRandom();

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        return digits.length() >= 10 ? digits.substring(digits.length() - 10) : digits;
    }

    @Transactional
    public ClientDto.ClientResponse createClient(ClientDto.CreateClientRequest request, User performedBy) {
        String cleanPhone = normalizePhone(request.getPhoneNumber());

        // Check for existing master client by phone number
        if (!cleanPhone.isEmpty()) {
            List<Client> existingMatches = clientRepository.findByPhoneSuffix(cleanPhone);
            if (!existingMatches.isEmpty()) {
                Client masterClient = existingMatches.get(0);
                
                // Append new opportunity / inquiry specs to existing client's notes
                String newInquiryNote = "\n[" + LocalDate.now() + "] Ingested Opportunity: " + 
                        (request.getInsuranceType() != null ? request.getInsuranceType() : "Inquiry") +
                        (request.getNotes() != null ? " - " + request.getNotes() : "");

                String currentNotes = masterClient.getNotes() != null ? masterClient.getNotes() : "";
                masterClient.setNotes((currentNotes + newInquiryNote).trim());

                // Update city or email if missing on master client
                if ((masterClient.getCity() == null || masterClient.getCity().isBlank()) && request.getCity() != null) {
                    masterClient.setCity(request.getCity());
                }
                if ((masterClient.getEmail() == null || masterClient.getEmail().isBlank()) && request.getEmail() != null) {
                    masterClient.setEmail(request.getEmail());
                }

                Client updated = clientRepository.save(masterClient);

                auditService.logAction("CLIENT", updated.getId(), "LINK_OPPORTUNITY", "NOTES", null,
                        "Linked additional inquiry (" + (request.getInsuranceType() != null ? request.getInsuranceType() : "General") + ") to existing client: " + updated.getFullName() + " (" + updated.getClientCode() + ")", performedBy, null);

                return mapToClientResponse(updated);
            }
        }

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

        Client client = Client.builder()
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

        Client saved = clientRepository.save(client);

        auditService.logAction("CLIENT", saved.getId(), "CREATE", "ALL", null,
                "Created new client: " + saved.getFullName() + " (" + saved.getClientCode() + ")", performedBy, null);

        return mapToClientResponse(saved);
    }

    @Transactional
    public List<ClientDto.ClientResponse> bulkImportClients(List<ClientDto.CreateClientRequest> requests, User performedBy) {
        List<ClientDto.ClientResponse> responses = new java.util.ArrayList<>();
        for (ClientDto.CreateClientRequest request : requests) {
            if (request.getFullName() != null && !request.getFullName().trim().isEmpty() &&
                request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
                responses.add(createClient(request, performedBy));
            }
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public ClientDto.ClientResponse getClientById(Long clientId, User user) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));
        return mapToClientResponse(client);
    }

    @Transactional
    public ClientDto.ClientResponse updateClient(Long clientId, ClientDto.CreateClientRequest request, User performedBy) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));
        String oldStage = client.getStage();

        // Granular Field-Level Audit Trail Tracking
        if (request.getFullName() != null && !request.getFullName().equals(client.getFullName())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Full Name", client.getFullName(), request.getFullName(), performedBy, null);
            client.setFullName(request.getFullName());
        }
        if (request.getCompanyName() != null && !request.getCompanyName().equals(client.getCompanyName())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Company Name", client.getCompanyName(), request.getCompanyName(), performedBy, null);
            client.setCompanyName(request.getCompanyName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(client.getPhoneNumber())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Phone Number", client.getPhoneNumber(), request.getPhoneNumber(), performedBy, null);
            client.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getWhatsappNumber() != null && !request.getWhatsappNumber().equals(client.getWhatsappNumber())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "WhatsApp Number", client.getWhatsappNumber(), request.getWhatsappNumber(), performedBy, null);
            client.setWhatsappNumber(request.getWhatsappNumber());
        }
        if (request.getEmail() != null && !request.getEmail().equals(client.getEmail())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Email", client.getEmail(), request.getEmail(), performedBy, null);
            client.setEmail(request.getEmail());
        }
        if (request.getDob() != null && !request.getDob().equals(client.getDob())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Date of Birth", String.valueOf(client.getDob()), String.valueOf(request.getDob()), performedBy, null);
            client.setDob(request.getDob());
        }
        if (request.getCity() != null && !request.getCity().equals(client.getCity())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "City", client.getCity(), request.getCity(), performedBy, null);
            client.setCity(request.getCity());
        }
        if (request.getState() != null && !request.getState().equals(client.getState())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "State", client.getState(), request.getState(), performedBy, null);
            client.setState(request.getState());
        }
        if (request.getPincode() != null && !request.getPincode().equals(client.getPincode())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Pincode", client.getPincode(), request.getPincode(), performedBy, null);
            client.setPincode(request.getPincode());
        }
        if (request.getInsuranceType() != null && !request.getInsuranceType().equals(client.getInsuranceType())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Insurance Type", client.getInsuranceType(), request.getInsuranceType(), performedBy, null);
            client.setInsuranceType(request.getInsuranceType());
        }
        if (request.getExistingInsurer() != null && !request.getExistingInsurer().equals(client.getExistingInsurer())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Existing Insurer", client.getExistingInsurer(), request.getExistingInsurer(), performedBy, null);
            client.setExistingInsurer(request.getExistingInsurer());
        }
        if (request.getPolicyExpiryDate() != null && !request.getPolicyExpiryDate().equals(client.getPolicyExpiryDate())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Policy Expiry Date", String.valueOf(client.getPolicyExpiryDate()), String.valueOf(request.getPolicyExpiryDate()), performedBy, null);
            client.setPolicyExpiryDate(request.getPolicyExpiryDate());
        }
        if (request.getSumInsured() != null && !request.getSumInsured().equals(client.getSumInsured())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Sum Insured", client.getSumInsured(), request.getSumInsured(), performedBy, null);
            client.setSumInsured(request.getSumInsured());
        }
        if (request.getEstimatedPremium() != null && !request.getEstimatedPremium().equals(client.getEstimatedPremium())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Estimated Premium", "₹" + client.getEstimatedPremium(), "₹" + request.getEstimatedPremium(), performedBy, null);
            client.setEstimatedPremium(request.getEstimatedPremium());
        }
        if (request.getPriority() != null && !request.getPriority().equals(client.getPriority())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Priority", client.getPriority(), request.getPriority(), performedBy, null);
            client.setPriority(request.getPriority());
        }
        if (request.getNotes() != null && !request.getNotes().equals(client.getNotes())) {
            auditService.logAction("CLIENT", client.getId(), "UPDATE", "Notes", client.getNotes(), request.getNotes(), performedBy, null);
            client.setNotes(request.getNotes());
        }

        if (request.getStage() != null && !request.getStage().equals(oldStage)) {
            auditService.logAction("CLIENT", client.getId(), "STATUS_CHANGE", "Sales Stage", oldStage, request.getStage(), performedBy, null);
            client.setStage(request.getStage());
        }

        if (request.getAssignedAdvisorId() != null) {
            User advisor = userRepository.findById(request.getAssignedAdvisorId())
                    .orElse(null);
            if (advisor != null && (client.getAssignedAdvisor() == null || !advisor.getId().equals(client.getAssignedAdvisor().getId()))) {
                String oldAdvisorName = client.getAssignedAdvisor() != null ? client.getAssignedAdvisor().getFullName() : "Unassigned";
                auditService.logAction("CLIENT", client.getId(), "REASSIGN", "Assigned Advisor", oldAdvisorName, advisor.getFullName(), performedBy, null);
                client.setAssignedAdvisor(advisor);
                client.setManager(advisor.getManager());
            }
        }

        Client updated = clientRepository.save(client);
        return mapToClientResponse(updated);
    }

    @Transactional
    public ClientDto.ClientResponse reassignClient(Long clientId, Long targetAdvisorId, String reason, User performedBy) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        User newAdvisor = userRepository.findById(targetAdvisorId)
                .orElseThrow(() -> new IllegalArgumentException("Advisor not found with ID: " + targetAdvisorId));

        String oldAdvisorName = client.getAssignedAdvisor() != null ? client.getAssignedAdvisor().getFullName() : "Unassigned";

        client.setAssignedAdvisor(newAdvisor);
        client.setManager(newAdvisor.getManager());
        Client updated = clientRepository.save(client);

        auditService.logAction("CLIENT", updated.getId(), "REASSIGN", "ASSIGNED_ADVISOR",
                oldAdvisorName, newAdvisor.getFullName() + (reason != null ? " (" + reason + ")" : ""), performedBy, null);

        return mapToClientResponse(updated);
    }

    @Transactional
    public CallLogDto.CallLogResponse logCall(CallLogDto.LogCallRequest request, User advisor) {
        Client client = clientRepository.findById(request.getClientId())
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
                    .channel("CALL")
                    .status("PENDING")
                    .notes("Automated reminder from call log: " + request.getCallResult())
                    .build();
            followUpTaskRepository.save(task);
        }

        // Advance client stage if positive outcome
        if ("INTERESTED".equals(request.getCallResult()) || "QUOTE_REQUESTED".equals(request.getCallResult())) {
            client.setStage("INTERESTED");
            clientRepository.save(client);
        } else if ("CONVERTED".equals(request.getCallResult())) {
            client.setStage("POLICY_ISSUED");
            clientRepository.save(client);
        } else if ("CONTACTED".equals(client.getStage()) || "NEW_LEAD".equals(client.getStage())) {
            client.setStage("CONTACTED");
            clientRepository.save(client);
        }

        auditService.logAction("CLIENT", client.getId(), "CALL_LOGGED", "CALL_RESULT",
                null, request.getCallResult() + (request.getCallNotes() != null ? " - " + request.getCallNotes() : ""), advisor, null);

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

    @Transactional(readOnly = true)
    public List<CallLogDto.CallLogResponse> getCallHistory(User user) {
        boolean isSuperAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<CallLog> logs;
        if (isSuperAdmin) {
            logs = callLogRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        } else if (isManager) {
            logs = callLogRepository.findByManagerIdOrderByCreatedAtDesc(user.getId());
        } else {
            logs = callLogRepository.findByAdvisorIdOrderByCreatedAtDesc(user.getId());
        }

        return logs.stream().map(l -> CallLogDto.CallLogResponse.builder()
                .id(l.getId())
                .clientId(l.getClient() != null ? l.getClient().getId() : null)
                .clientName(l.getClient() != null ? l.getClient().getFullName() : "Unknown")
                .clientPhone(l.getClient() != null ? l.getClient().getPhoneNumber() : "")
                .advisorId(l.getAdvisor() != null ? l.getAdvisor().getId() : null)
                .advisorName(l.getAdvisor() != null ? l.getAdvisor().getFullName() : "Advisor")
                .callResult(l.getCallResult())
                .callDurationSeconds(l.getCallDurationSeconds())
                .callNotes(l.getCallNotes())
                .nextFollowUpDate(l.getNextFollowUpDate())
                .createdAt(l.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CallLogDto.CallLogResponse> getCallLogsForClient(Long clientId) {
        return callLogRepository.findByClientIdOrderByCreatedAtDesc(clientId).stream().map(l -> CallLogDto.CallLogResponse.builder()
                .id(l.getId())
                .clientId(l.getClient() != null ? l.getClient().getId() : null)
                .clientName(l.getClient() != null ? l.getClient().getFullName() : "")
                .clientPhone(l.getClient() != null ? l.getClient().getPhoneNumber() : "")
                .advisorId(l.getAdvisor() != null ? l.getAdvisor().getId() : null)
                .advisorName(l.getAdvisor() != null ? l.getAdvisor().getFullName() : "")
                .callResult(l.getCallResult())
                .callDurationSeconds(l.getCallDurationSeconds())
                .callNotes(l.getCallNotes())
                .nextFollowUpDate(l.getNextFollowUpDate())
                .createdAt(l.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public MeetingDto.MeetingResponse scheduleMeeting(MeetingDto.ScheduleMeetingRequest request, User advisor) {
        if (request.getMeetingDatetime() == null) {
            throw new IllegalArgumentException("Meeting date and time are required.");
        }

        // Allow same-day past-hour scheduling for manual retroactive meeting logging or timezone variance
        if (request.getMeetingDatetime().toLocalDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Meeting cannot be scheduled on a past date. Please select today or a future date.");
        }

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        String meetCode = "meet.google.com/" + UUID.randomUUID().toString().substring(0, 3) + "-" +
                UUID.randomUUID().toString().substring(0, 4) + "-" + UUID.randomUUID().toString().substring(0, 3);

        ClientMeeting meeting = ClientMeeting.builder()
                .client(client)
                .advisor(advisor)
                .title(request.getTitle() != null ? request.getTitle() : "Insurance Consultation with " + client.getFullName())
                .purpose(request.getPurpose())
                .product(request.getProduct() != null ? request.getProduct() : client.getInsuranceType())
                .meetingDatetime(request.getMeetingDatetime())
                .endDatetime(request.getEndDatetime() != null ? request.getEndDatetime() : request.getMeetingDatetime().plusMinutes(45))
                .googleMeetUrl(request.getGoogleMeetUrl() != null ? request.getGoogleMeetUrl() : "https://" + meetCode)
                .googleCalendarEventId("cal_event_" + System.currentTimeMillis())
                .meetingType(request.getMeetingType() != null ? request.getMeetingType() : "VIRTUAL_GOOGLE_MEET")
                .location(request.getLocation())
                .status("SCHEDULED")
                .build();

        ClientMeeting saved = clientMeetingRepository.save(meeting);

        // Advance client stage to MEETING if currently at earlier stage
        if ("NEW_LEAD".equals(client.getStage()) || "CONTACTED".equals(client.getStage()) || "FOLLOWUP".equals(client.getStage())) {
            client.setStage("MEETING");
            clientRepository.save(client);
        }

        auditService.logAction("CLIENT", client.getId(), "MEETING_SCHEDULED", "Consultation Scheduled", null,
                "Scheduled for " + meeting.getMeetingDatetime().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) + 
                ("GOOGLE_MEET".equalsIgnoreCase(meeting.getMeetingType()) ? " via Google Meet" : " (" + meeting.getMeetingType() + ")") +
                (meeting.getPurpose() != null ? " • Topic: " + meeting.getPurpose() : ""), advisor, null);

        return mapToMeetingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClientDto.ClientResponse> getClientsForUser(User user) {
        boolean isSuperAdmin = user == null || user.getRoles() == null || user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user != null && user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<Client> clients;
        if (isSuperAdmin) {
            clients = clientRepository.findAll();
        } else if (isManager) {
            clients = clientRepository.findByManagerIdOrderByUpdatedAtDesc(user.getId());
        } else {
            clients = clientRepository.findByAssignedAdvisorIdOrderByUpdatedAtDesc(user.getId());
        }

        return clients.stream().map(this::mapToClientResponse).collect(Collectors.toList());
    }

    @Transactional
    public FollowUpDto.FollowUpResponse createFollowUp(FollowUpDto.CreateFollowUpRequest request, User advisor) {
        if (request.getClientId() == null) {
            throw new IllegalArgumentException("Client ID is required to schedule a callback.");
        }
        if (request.getScheduledDatetime() == null) {
            throw new IllegalArgumentException("Scheduled date and time are required.");
        }
        // Allow same-day past-hour scheduling for manual retroactive task recording or clock discrepancies
        if (request.getScheduledDatetime().toLocalDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Follow-up cannot be scheduled on a past date. Please select today or a future date.");
        }

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        FollowUpTask task = FollowUpTask.builder()
                .client(client)
                .advisor(advisor != null ? advisor : client.getAssignedAdvisor())
                .scheduledDatetime(request.getScheduledDatetime())
                .reminderMilestone(request.getReminderMilestone() != null ? request.getReminderMilestone() : "EXACT")
                .channel(request.getChannel() != null ? request.getChannel() : "PHONE_CALL")
                .status("PENDING")
                .notes(request.getNotes() != null ? request.getNotes() : "Scheduled client follow-up callback")
                .build();

        FollowUpTask saved = followUpTaskRepository.save(task);

        auditService.logAction("CLIENT", client.getId(), "FOLLOWUP_SCHEDULED", "Callback Scheduled", null,
                "Follow-up scheduled for " + task.getScheduledDatetime().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) + 
                " via " + task.getChannel() + (task.getNotes() != null ? " • Note: " + task.getNotes() : ""), advisor, null);

        return mapToFollowUpResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto.FollowUpResponse> getDueTodayFollowUps(User user) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        boolean isSuperAdmin = user == null || user.getRoles() == null || user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user != null && user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<FollowUpTask> tasks;
        if (isSuperAdmin) {
            tasks = followUpTaskRepository.findAllDueToday(startOfDay, endOfDay);
        } else if (isManager) {
            tasks = followUpTaskRepository.findDueTodayForManager(user.getId(), startOfDay, endOfDay);
        } else {
            tasks = followUpTaskRepository.findDueTodayForAdvisor(user.getId(), startOfDay, endOfDay);
        }

        return tasks.stream().map(this::mapToFollowUpResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto.FollowUpResponse> getOverdueFollowUps(User user) {
        LocalDateTime now = LocalDateTime.now();

        boolean isSuperAdmin = user == null || user.getRoles() == null || user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user != null && user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<FollowUpTask> tasks;
        if (isSuperAdmin) {
            tasks = followUpTaskRepository.findAllOverdue(now);
        } else if (isManager) {
            tasks = followUpTaskRepository.findOverdueForManager(user.getId(), now);
        } else {
            tasks = followUpTaskRepository.findOverdueForAdvisor(user.getId(), now);
        }

        return tasks.stream().map(this::mapToFollowUpResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDto.MeetingResponse> getUpcomingMeetings(User user) {
        // Broad calendar window (from start of current month / past 30 days to next 90 days)
        LocalDateTime start = LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = LocalDate.now().plusDays(90).atTime(LocalTime.MAX);

        boolean isSuperAdmin = user == null || user.getRoles() == null || user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user != null && user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<ClientMeeting> meetings;
        if (isSuperAdmin) {
            meetings = clientMeetingRepository.findAllMeetingsBetween(start, end);
        } else if (isManager) {
            meetings = clientMeetingRepository.findMeetingsForManagerBetween(user.getId(), start, end);
        } else {
            meetings = clientMeetingRepository.findMeetingsForAdvisorBetween(user.getId(), start, end);
        }

        return meetings.stream().map(this::mapToMeetingResponse).collect(Collectors.toList());
    }

    public ClientDto.ClientResponse mapToClientResponse(Client client) {
        return ClientDto.ClientResponse.builder()
                .id(client.getId())
                .clientCode(client.getClientCode())
                .fullName(client.getFullName())
                .companyName(client.getCompanyName())
                .phoneNumber(client.getPhoneNumber())
                .whatsappNumber(client.getWhatsappNumber())
                .email(client.getEmail())
                .dob(client.getDob())
                .city(client.getCity())
                .state(client.getState())
                .pincode(client.getPincode())
                .insuranceType(client.getInsuranceType())
                .existingInsurer(client.getExistingInsurer())
                .policyExpiryDate(client.getPolicyExpiryDate())
                .sumInsured(client.getSumInsured())
                .estimatedPremium(client.getEstimatedPremium())
                .leadSource(client.getLeadSource())
                .stage(client.getStage())
                .priority(client.getPriority())
                .assignedAdvisorId(client.getAssignedAdvisor() != null ? client.getAssignedAdvisor().getId() : null)
                .assignedAdvisorName(client.getAssignedAdvisor() != null ? client.getAssignedAdvisor().getFullName() : "Unassigned")
                .managerId(client.getManager() != null ? client.getManager().getId() : null)
                .managerName(client.getManager() != null ? client.getManager().getFullName() : "None")
                .notes(client.getNotes())
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
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

    @Transactional
    public MeetingDto.MeetingResponse updateMeetingOutcome(Long meetingId, MeetingDto.UpdateMeetingOutcomeRequest request, User performedBy) {
        ClientMeeting meeting = clientMeetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found with ID: " + meetingId));

        String oldStatus = meeting.getStatus();
        if (request.getStatus() != null) {
            meeting.setStatus(request.getStatus());
        }
        if (request.getOutcomeNotes() != null) {
            meeting.setOutcomeNotes(request.getOutcomeNotes());
        }

        // Auto-advance client stage if outcome is successful
        if ("COMPLETED".equalsIgnoreCase(request.getStatus())) {
            Client client = meeting.getClient();
            if ("MEETING".equalsIgnoreCase(client.getStage()) || "CONTACTED".equalsIgnoreCase(client.getStage())) {
                client.setStage("QUOTATION");
                clientRepository.save(client);
            }
        }

        ClientMeeting updated = clientMeetingRepository.save(meeting);
        auditService.logAction("MEETING", updated.getId(), "UPDATE_OUTCOME", "Status", oldStatus, meeting.getStatus(), performedBy, null);

        return mapToMeetingResponse(updated);
    }

    public MeetingDto.MeetingResponse mapToMeetingResponse(ClientMeeting meeting) {
        return MeetingDto.MeetingResponse.builder()
                .id(meeting.getId())
                .clientId(meeting.getClient().getId())
                .clientCode(meeting.getClient().getClientCode())
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

    // ==========================================
    // MULTI-PRODUCT OPPORTUNITIES PIPELINE (INDUSTRY STANDARD)
    // ==========================================

    @Transactional(readOnly = true)
    public List<OpportunityDto.OpportunityResponse> getClientOpportunities(Long clientId) {
        // Ensure client exists
        clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        List<ClientOpportunity> opps = clientOpportunityRepository.findByClientIdOrderByIsPrimaryDescCreatedAtDesc(clientId);
        return opps.stream().map(this::mapToOpportunityResponse).collect(Collectors.toList());
    }

    @Transactional
    public OpportunityDto.OpportunityResponse createOpportunity(Long clientId, OpportunityDto.CreateOpportunityRequest request, User performedBy) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        QuoteInquiry inquiry = null;
        if (request.getInquiryId() != null) {
            inquiry = quoteInquiryRepository.findById(request.getInquiryId()).orElse(null);
        }

        User advisor = client.getAssignedAdvisor();
        if (request.getAssignedAdvisorId() != null) {
            advisor = userRepository.findById(request.getAssignedAdvisorId()).orElse(advisor);
        }

        ClientOpportunity opportunity = ClientOpportunity.builder()
                .client(client)
                .inquiry(inquiry)
                .categorySlug(request.getCategorySlug() != null ? request.getCategorySlug().toUpperCase() : "HEALTH")
                .productName(request.getProductName() != null ? request.getProductName() : "Insurance Policy")
                .coverageAmount(request.getCoverageAmount())
                .estimatedPremium(request.getEstimatedPremium())
                .stage(request.getStage() != null ? request.getStage().toUpperCase() : "NEW_LEAD")
                .priority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM")
                .isPrimary(Boolean.TRUE.equals(request.getIsPrimary()))
                .assignedAdvisor(advisor)
                .specs(request.getSpecs())
                .notes(request.getNotes())
                .build();

        ClientOpportunity saved = clientOpportunityRepository.save(opportunity);

        auditService.logAction(
                "CLIENT_OPPORTUNITY",
                saved.getId(),
                "CREATE",
                "Product",
                null,
                saved.getProductName() + " (" + saved.getCategorySlug() + ")",
                performedBy,
                "Added new opportunity for client " + client.getFullName()
        );

        return mapToOpportunityResponse(saved);
    }

    @Transactional
    public OpportunityDto.OpportunityResponse updateOpportunityStage(Long opportunityId, OpportunityDto.UpdateStageRequest request, User performedBy) {
        ClientOpportunity opp = clientOpportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found with ID: " + opportunityId));

        String oldStage = opp.getStage();
        String newStage = request.getStage() != null ? request.getStage().toUpperCase() : oldStage;

        opp.setStage(newStage);
        if (request.getReason() != null && !request.getReason().isBlank()) {
            String currentNotes = opp.getNotes() != null ? opp.getNotes() : "";
            opp.setNotes((currentNotes + "\n[" + LocalDate.now() + "] Stage updated: " + request.getReason()).trim());
        }

        ClientOpportunity saved = clientOpportunityRepository.save(opp);

        // If this opportunity was generated from a quote inquiry, sync the inquiry status
        if (opp.getInquiry() != null) {
            opp.getInquiry().setStatus(newStage);
            quoteInquiryRepository.save(opp.getInquiry());
        }

        // If this is the primary opportunity, keep master client stage synchronized
        if (Boolean.TRUE.equals(opp.getIsPrimary())) {
            opp.getClient().setStage(newStage);
            clientRepository.save(opp.getClient());
        }

        auditService.logAction(
                "CLIENT_OPPORTUNITY",
                saved.getId(),
                "STAGE_CHANGE",
                "stage",
                oldStage,
                newStage,
                performedBy,
                request.getReason() != null ? request.getReason() : "Transitioned stage for " + saved.getProductName()
        );

        return mapToOpportunityResponse(saved);
    }

    public OpportunityDto.OpportunityResponse mapToOpportunityResponse(ClientOpportunity opp) {
        return OpportunityDto.OpportunityResponse.builder()
                .id(opp.getId())
                .clientId(opp.getClient().getId())
                .clientCode(opp.getClient().getClientCode())
                .clientName(opp.getClient().getFullName())
                .inquiryId(opp.getInquiry() != null ? opp.getInquiry().getId() : null)
                .categorySlug(opp.getCategorySlug())
                .productName(opp.getProductName())
                .coverageAmount(opp.getCoverageAmount())
                .estimatedPremium(opp.getEstimatedPremium())
                .stage(opp.getStage())
                .priority(opp.getPriority())
                .isPrimary(opp.getIsPrimary())
                .assignedAdvisorId(opp.getAssignedAdvisor() != null ? opp.getAssignedAdvisor().getId() : null)
                .assignedAdvisorName(opp.getAssignedAdvisor() != null ? opp.getAssignedAdvisor().getFullName() : "Unassigned")
                .specs(opp.getSpecs())
                .notes(opp.getNotes())
                .createdAt(opp.getCreatedAt())
                .updatedAt(opp.getUpdatedAt())
                .build();
    }
}
