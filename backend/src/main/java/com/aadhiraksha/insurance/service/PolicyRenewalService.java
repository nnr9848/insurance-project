package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.PolicyRenewalDto;
import com.aadhiraksha.insurance.model.Client;
import com.aadhiraksha.insurance.model.FollowUpTask;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClientRepository;
import com.aadhiraksha.insurance.repository.FollowUpTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyRenewalService {

    private final ClientRepository clientRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final AuditService auditService;

    /**
     * Automated Milestone Engine: Runs daily at 08:00 AM.
     * Evaluates policy expirations across 45, 30, 15, 7, and 1-day windows.
     * Auto-creates CRM follow-up callback tasks for the assigned advisors.
     */
    @Scheduled(cron = "0 0 8 * * *") // Daily at 8:00 AM
    @Transactional
    public void executeAutomatedRenewalMilestoneScan() {
        log.info("Starting Automated Policy Renewal Milestone Engine Scan...");
        LocalDate today = LocalDate.now();
        LocalDate maxScanDate = today.plusDays(45);

        List<Client> expiringLeads = clientRepository.findExpiringPolicies(today.minusDays(15), maxScanDate);
        int tasksGenerated = 0;

        for (Client lead : expiringLeads) {
            if (lead.getPolicyExpiryDate() == null || lead.getAssignedAdvisor() == null) {
                continue;
            }

            long daysLeft = ChronoUnit.DAYS.between(today, lead.getPolicyExpiryDate());
            String milestone = null;

            if (daysLeft == 45) {
                milestone = "RENEWAL_45_DAYS";
            } else if (daysLeft == 30) {
                milestone = "RENEWAL_30_DAYS";
            } else if (daysLeft == 15) {
                milestone = "RENEWAL_15_DAYS";
            } else if (daysLeft == 7) {
                milestone = "RENEWAL_7_DAYS";
            } else if (daysLeft == 1) {
                milestone = "RENEWAL_1_DAY";
            } else if (daysLeft == 0) {
                milestone = "RENEWAL_TODAY";
            }

            if (milestone != null) {
                // Check if task already generated for today
                List<FollowUpTask> existingTasks = followUpTaskRepository.findByClientIdOrderByScheduledDatetimeDesc(lead.getId());
                final String currentMilestone = milestone;
                boolean alreadyCreated = existingTasks.stream().anyMatch(t -> 
                    currentMilestone.equals(t.getReminderMilestone()) && 
                    t.getScheduledDatetime().toLocalDate().isEqual(today)
                );

                if (!alreadyCreated) {
                    FollowUpTask task = FollowUpTask.builder()
                            .client(lead)
                            .advisor(lead.getAssignedAdvisor())
                            .scheduledDatetime(today.atTime(10, 0)) // 10:00 AM callback
                            .reminderMilestone(milestone)
                            .channel("WHATSAPP")
                            .status("PENDING")
                            .notes("🛡️ Automated Renewal Alert: " + lead.getInsuranceType() + " policy with " +
                                    (lead.getExistingInsurer() != null ? lead.getExistingInsurer() : "current insurer") +
                                    " expires in " + daysLeft + " days (" + lead.getPolicyExpiryDate() + "). Share renewal comparison & protect NCB.")
                            .build();

                    followUpTaskRepository.save(task);
                    tasksGenerated++;

                    auditService.logAction("CLIENT", lead.getId(), "AUTO_RENEWAL_TASK_CREATED", "RENEWAL",
                            null, "Generated automated renewal milestone task: " + milestone, lead.getAssignedAdvisor(), null);
                }
            }
        }

        log.info("Policy Renewal Milestone Engine completed. Generated {} automated reminder tasks.", tasksGenerated);
    }

    /**
     * Get Aggregated Policy Renewal Desk Summary Metrics
     */
    @Transactional(readOnly = true)
    public PolicyRenewalDto.RenewalSummaryResponse getRenewalSummary(User user) {
        LocalDate today = LocalDate.now();
        List<Client> allLeads = getScopedLeadsForUser(user);

        long due45 = 0;
        long due30 = 0;
        long due15 = 0;
        long due7 = 0;
        long expired = 0;
        BigDecimal totalPremium = BigDecimal.ZERO;
        long convertedRenewals = 0;

        for (Client lead : allLeads) {
            if (lead.getPolicyExpiryDate() != null) {
                long days = ChronoUnit.DAYS.between(today, lead.getPolicyExpiryDate());

                if (days < 0) {
                    expired++;
                } else if (days <= 7) {
                    due7++;
                } else if (days <= 15) {
                    due15++;
                } else if (days <= 30) {
                    due30++;
                } else if (days <= 45) {
                    due45++;
                }

                if (lead.getEstimatedPremium() != null && days >= -30 && days <= 45) {
                    totalPremium = totalPremium.add(lead.getEstimatedPremium());
                }

                if ("POLICY_ISSUED".equals(lead.getStage())) {
                    convertedRenewals++;
                }
            }
        }

        long totalExpiring = due45 + due30 + due15 + due7 + expired;
        double retentionRate = totalExpiring > 0 ? ((double) convertedRenewals / totalExpiring) * 100 : 85.0;

        return PolicyRenewalDto.RenewalSummaryResponse.builder()
                .totalExpiringPolicies(totalExpiring)
                .dueIn45Days(due45)
                .dueIn30Days(due30)
                .dueIn15Days(due15)
                .dueIn7Days(due7)
                .expiredLapsed(expired)
                .totalRenewalPremiumAtRisk(totalPremium)
                .renewalRetentionRate(Math.round(retentionRate * 10.0) / 10.0)
                .build();
    }

    /**
     * Get Scoped List of Expiring Policy Items
     */
    @Transactional(readOnly = true)
    public List<PolicyRenewalDto.RenewalItemResponse> getRenewalList(User user, String bucket) {
        LocalDate today = LocalDate.now();
        List<Client> leads = getScopedLeadsForUser(user);

        List<PolicyRenewalDto.RenewalItemResponse> results = new ArrayList<>();

        for (Client lead : leads) {
            if (lead.getPolicyExpiryDate() == null) continue;

            long daysLeft = ChronoUnit.DAYS.between(today, lead.getPolicyExpiryDate());
            String urgencyBucket;

            if (daysLeft < 0) {
                urgencyBucket = "EXPIRED";
            } else if (daysLeft == 0) {
                urgencyBucket = "TODAY";
            } else if (daysLeft <= 7) {
                urgencyBucket = "7_DAYS";
            } else if (daysLeft <= 15) {
                urgencyBucket = "15_DAYS";
            } else if (daysLeft <= 30) {
                urgencyBucket = "30_DAYS";
            } else if (daysLeft <= 45) {
                urgencyBucket = "45_DAYS";
            } else {
                urgencyBucket = "FUTURE";
            }

            // Filter by requested bucket if specified
            if (bucket != null && !bucket.equalsIgnoreCase("ALL") && !bucket.equalsIgnoreCase(urgencyBucket)) {
                continue;
            }

            String template = generateWhatsAppRenewalTemplate(lead, daysLeft);

            results.add(PolicyRenewalDto.RenewalItemResponse.builder()
                    .clientId(lead.getId())
                    .clientCode(lead.getClientCode())
                    .fullName(lead.getFullName())
                    .phoneNumber(lead.getPhoneNumber())
                    .whatsappNumber(lead.getWhatsappNumber() != null ? lead.getWhatsappNumber() : lead.getPhoneNumber())
                    .email(lead.getEmail())
                    .city(lead.getCity())
                    .insuranceType(lead.getInsuranceType())
                    .existingInsurer(lead.getExistingInsurer() != null ? lead.getExistingInsurer() : "Current Insurer")
                    .policyExpiryDate(lead.getPolicyExpiryDate())
                    .daysUntilExpiry(daysLeft)
                    .urgencyBucket(urgencyBucket)
                    .sumInsured(lead.getSumInsured())
                    .estimatedPremium(lead.getEstimatedPremium())
                    .stage(lead.getStage())
                    .assignedAdvisorId(lead.getAssignedAdvisor() != null ? lead.getAssignedAdvisor().getId() : null)
                    .assignedAdvisorName(lead.getAssignedAdvisor() != null ? lead.getAssignedAdvisor().getFullName() : "Unassigned")
                    .managerId(lead.getManager() != null ? lead.getManager().getId() : null)
                    .managerName(lead.getManager() != null ? lead.getManager().getFullName() : "None")
                    .lastFollowUpNotes(lead.getNotes())
                    .recommendedWhatsAppTemplate(template)
                    .build());
        }

        // Sort by expiry date ascending (urgent first)
        results.sort((a, b) -> a.getPolicyExpiryDate().compareTo(b.getPolicyExpiryDate()));
        return results;
    }

    /**
     * Dispatch / Log Instant Renewal Reminder
     */
    @Transactional
    public PolicyRenewalDto.SendReminderResponse sendRenewalReminder(PolicyRenewalDto.SendReminderRequest request, User sender) {
        Client lead = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        long daysLeft = lead.getPolicyExpiryDate() != null 
                ? ChronoUnit.DAYS.between(LocalDate.now(), lead.getPolicyExpiryDate()) 
                : 0;

        String preview = request.getCustomMessage() != null && !request.getCustomMessage().trim().isEmpty()
                ? request.getCustomMessage()
                : generateWhatsAppRenewalTemplate(lead, daysLeft);

        // Record Audit log
        auditService.logAction("CLIENT", lead.getId(), "RENEWAL_REMINDER_SENT", request.getChannel(),
                null, "Dispatched renewal notice via " + request.getChannel() + " to " + lead.getPhoneNumber(), sender, null);

        return PolicyRenewalDto.SendReminderResponse.builder()
                .success(true)
                .channel(request.getChannel())
                .message("Renewal reminder prepared and dispatched successfully.")
                .recipientPhone(lead.getPhoneNumber())
                .recipientEmail(lead.getEmail())
                .previewText(preview)
                .build();
    }

    private String generateWhatsAppRenewalTemplate(Client lead, long daysLeft) {
        String greeting = "Hello " + lead.getFullName() + ", ";
        String urgency;
        if (daysLeft < 0) {
            urgency = "your " + lead.getInsuranceType() + " policy expired on " + lead.getPolicyExpiryDate() + ". Renew today to avoid policy break-in, medical re-checkups, and loss of No Claim Bonus (NCB).";
        } else if (daysLeft == 0) {
            urgency = "your " + lead.getInsuranceType() + " policy expires *TODAY* (" + lead.getPolicyExpiryDate() + "). Renew now to enjoy uninterrupted cashless coverage.";
        } else {
            urgency = "your " + lead.getInsuranceType() + " policy with " + (lead.getExistingInsurer() != null ? lead.getExistingInsurer() : "your insurer") +
                    " is due for renewal in *" + daysLeft + " days* (on " + lead.getPolicyExpiryDate() + ").";
        }

        return greeting + urgency + "\n\n" +
                "🛡️ *Sum Insured:* " + (lead.getSumInsured() != null ? lead.getSumInsured() : "₹5-10 Lakhs") + "\n" +
                "💰 *Estimated Premium:* " + (lead.getEstimatedPremium() != null ? "₹" + lead.getEstimatedPremium() : "Best Market Quote") + "\n\n" +
                "Would you like us to generate the comparison quote with enhanced coverage options?\n" +
                "— *Aadhiraksha InsurTech Advisory Team*";
    }

    private List<Client> getScopedLeadsForUser(User user) {
        boolean isSuperAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        if (isSuperAdmin) {
            return clientRepository.findAll();
        } else if (isManager) {
            return clientRepository.findByManagerIdOrderByUpdatedAtDesc(user.getId());
        } else {
            return clientRepository.findByAssignedAdvisorIdOrderByUpdatedAtDesc(user.getId());
        }
    }
}

