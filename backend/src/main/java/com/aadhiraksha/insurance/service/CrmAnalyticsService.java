package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.ManagerAnalyticsDto;
import com.aadhiraksha.insurance.model.*;
import com.aadhiraksha.insurance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrmAnalyticsService {

    private final UserRepository userRepository;
    private final ClientLeadRepository clientLeadRepository;
    private final CallLogRepository callLogRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final ClientMeetingRepository clientMeetingRepository;
    private final QuotationProposalRepository quotationProposalRepository;

    @Transactional(readOnly = true)
    public ManagerAnalyticsDto.ManagerDashboardResponse getManagerDashboardAnalytics(User manager) {
        if (manager == null) {
            throw new IllegalArgumentException("User must be authenticated");
        }

        // 1. Identify Advisors under this Manager
        List<User> teamMembers = userRepository.findByManagerId(manager.getId());
        List<Long> teamMemberIds = teamMembers.stream().map(User::getId).collect(Collectors.toList());

        // 2. Lead population for the team
        List<ClientLead> teamLeads;
        boolean isSuperAdmin = manager.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        
        if (isSuperAdmin) {
            teamLeads = clientLeadRepository.findAll();
            if (teamMembers.isEmpty()) {
                teamMembers = userRepository.findByRoleName("ROLE_ADVISOR");
                teamMemberIds = teamMembers.stream().map(User::getId).collect(Collectors.toList());
            }
        } else {
            teamLeads = clientLeadRepository.findByManagerIdOrderByUpdatedAtDesc(manager.getId());
            // If some leads are directly assigned to team members
            final List<Long> finalMemberIds = teamMemberIds;
            if (teamLeads.isEmpty() && !finalMemberIds.isEmpty()) {
                teamLeads = clientLeadRepository.findAll().stream()
                        .filter(l -> l.getAssignedAdvisor() != null && finalMemberIds.contains(l.getAssignedAdvisor().getId()))
                        .collect(Collectors.toList());
            }
        }

        long totalLeads = teamLeads.size();

        // 3. Time boundaries
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDateTime now = LocalDateTime.now();

        // 4. Calls Today
        long callsToday = 0;
        for (Long advisorId : teamMemberIds) {
            callsToday += callLogRepository.countCallsTodayForAdvisor(advisorId, startOfDay);
        }
        if (isSuperAdmin && callsToday == 0) {
            callsToday = callLogRepository.countAllCallsToday(startOfDay);
        }

        // 5. Follow-ups Due & Overdue
        long dueToday = 0;
        long overdue = 0;
        if (isSuperAdmin) {
            dueToday = followUpTaskRepository.findAllDueToday(startOfDay, endOfDay).size();
            overdue = followUpTaskRepository.countAllOverdue(now);
        } else {
            dueToday = followUpTaskRepository.findDueTodayForManager(manager.getId(), startOfDay, endOfDay).size();
            overdue = followUpTaskRepository.findOverdueForManager(manager.getId(), now).size();
        }

        // 6. Meetings Today
        long meetingsToday = 0;
        if (isSuperAdmin) {
            meetingsToday = clientMeetingRepository.countAllMeetingsToday(startOfDay, endOfDay);
        } else {
            meetingsToday = clientMeetingRepository.findMeetingsForManagerBetween(manager.getId(), startOfDay, endOfDay).size();
        }

        // 7. Quotations & Policies Sold
        long quotationsCount = teamLeads.stream()
                .filter(l -> "QUOTATION".equalsIgnoreCase(l.getStage()) || "MEETING".equalsIgnoreCase(l.getStage()) || 
                             "DOCUMENTS".equalsIgnoreCase(l.getStage()) || "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) ||
                             "CONVERTED".equalsIgnoreCase(l.getStage()))
                .count();

        long policiesSold = teamLeads.stream()
                .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()) || "WON".equalsIgnoreCase(l.getStage()))
                .count();

        double conversionRate = totalLeads > 0 
                ? BigDecimal.valueOf(((double) policiesSold / totalLeads) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        BigDecimal totalPremium = teamLeads.stream()
                .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                .map(l -> l.getEstimatedPremium() != null ? l.getEstimatedPremium() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal targetPremium = BigDecimal.valueOf(Math.max(teamMembers.size() * 250000.0, 500000.0));
        double targetPct = targetPremium.compareTo(BigDecimal.ZERO) > 0
                ? totalPremium.divide(targetPremium, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        // 8. Advisor Performance Matrix
        List<ManagerAnalyticsDto.AdvisorPerformanceDto> teamPerformance = new ArrayList<>();
        for (User advisor : teamMembers) {
            List<ClientLead> advisorLeads = teamLeads.stream()
                    .filter(l -> l.getAssignedAdvisor() != null && l.getAssignedAdvisor().getId().equals(advisor.getId()))
                    .collect(Collectors.toList());

            long advCallsToday = callLogRepository.countCallsTodayForAdvisor(advisor.getId(), startOfDay);
            long advDueToday = followUpTaskRepository.findDueTodayForAdvisor(advisor.getId(), startOfDay, endOfDay).size();
            long advOverdue = followUpTaskRepository.countOverdueForAdvisor(advisor.getId(), now);
            long advMeetings = clientMeetingRepository.countMeetingsTodayForAdvisor(advisor.getId(), startOfDay, endOfDay);
            
            long advWon = advisorLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .count();

            long advQuotes = advisorLeads.stream()
                    .filter(l -> "QUOTATION".equalsIgnoreCase(l.getStage()) || "MEETING".equalsIgnoreCase(l.getStage()) || "DOCUMENTS".equalsIgnoreCase(l.getStage()))
                    .count();

            double advConversionRate = !advisorLeads.isEmpty()
                    ? BigDecimal.valueOf(((double) advWon / advisorLeads.size()) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            BigDecimal advPremium = advisorLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .map(l -> l.getEstimatedPremium() != null ? l.getEstimatedPremium() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String designation = advisor.getStaffProfile() != null && advisor.getStaffProfile().getDesignationName() != null
                    ? advisor.getStaffProfile().getDesignationName()
                    : (advisor.getStaffProfile() != null && advisor.getStaffProfile().getDesignation() != null ? advisor.getStaffProfile().getDesignation().getName() : "Insurance Advisor");

            teamPerformance.add(ManagerAnalyticsDto.AdvisorPerformanceDto.builder()
                    .advisorId(advisor.getId())
                    .advisorName(advisor.getFullName())
                    .email(advisor.getEmail())
                    .employeeCode(advisor.getEmployeeCode() != null ? advisor.getEmployeeCode() : "EMP-" + advisor.getId())
                    .designation(designation)
                    .isActive(advisor.getIsActive() != null ? advisor.getIsActive() : true)
                    .totalLeads(advisorLeads.size())
                    .callsToday(advCallsToday)
                    .followupsDueToday(advDueToday)
                    .overdueFollowups(advOverdue)
                    .meetingsScheduled(advMeetings)
                    .quotationsCount(advQuotes)
                    .policiesSold(advWon)
                    .conversionRate(advConversionRate)
                    .totalPremiumVolume(advPremium)
                    .build());
        }

        // Sort team performance by won deals descending
        teamPerformance.sort((a, b) -> Long.compare(b.getPoliciesSold(), a.getPoliciesSold()));

        // 9. Pipeline Stage Breakdown
        Map<String, String> stageLabels = new LinkedHashMap<>();
        stageLabels.put("NEW_LEAD", "New Leads");
        stageLabels.put("CONTACTED", "Contacted");
        stageLabels.put("FOLLOWUP", "In Follow-up");
        stageLabels.put("INTERESTED", "Interested");
        stageLabels.put("QUOTATION", "Quotation Sent");
        stageLabels.put("MEETING", "Meeting Scheduled");
        stageLabels.put("DOCUMENTS", "KYC / Documents");
        stageLabels.put("PAYMENT_PENDING", "Payment Processing");
        stageLabels.put("POLICY_ISSUED", "Policies Sold 🎉");
        stageLabels.put("LOST", "Lost / Closed");

        List<ManagerAnalyticsDto.PipelineStageCountDto> pipelineBreakdown = new ArrayList<>();
        for (Map.Entry<String, String> entry : stageLabels.entrySet()) {
            long count = teamLeads.stream()
                    .filter(l -> entry.getKey().equalsIgnoreCase(l.getStage()))
                    .count();
            pipelineBreakdown.add(ManagerAnalyticsDto.PipelineStageCountDto.builder()
                    .stage(entry.getKey())
                    .label(entry.getValue())
                    .count(count)
                    .build());
        }

        String branch = "Hyderabad Regional HQ";

        String department = manager.getStaffProfile() != null && manager.getStaffProfile().getDepartmentName() != null
                ? manager.getStaffProfile().getDepartmentName()
                : (manager.getStaffProfile() != null && manager.getStaffProfile().getDepartment() != null ? manager.getStaffProfile().getDepartment().getName() : "Retail Insurance");

        return ManagerAnalyticsDto.ManagerDashboardResponse.builder()
                .managerId(manager.getId())
                .managerName(manager.getFullName())
                .branch(branch)
                .department(department)
                .teamSize(teamMembers.size())
                .totalLeads(totalLeads)
                .callsToday(callsToday)
                .followupsDueToday(dueToday)
                .overdueFollowups(overdue)
                .meetingsToday(meetingsToday)
                .quotationsCount(quotationsCount)
                .policiesSold(policiesSold)
                .conversionRate(conversionRate)
                .totalPremiumGenerated(totalPremium)
                .targetPremium(targetPremium)
                .targetAchievementPercentage(targetPct)
                .teamPerformance(teamPerformance)
                .pipelineBreakdown(pipelineBreakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public com.aadhiraksha.insurance.dto.AdminAnalyticsDto.SuperAdminDashboardResponse getSuperAdminExecutiveAnalytics() {
        // 1. All Users Population
        List<User> allManagers = userRepository.findByRoleName("ROLE_MANAGER");
        List<User> allAdvisors = userRepository.findByRoleName("ROLE_ADVISOR");
        List<ClientLead> allLeads = clientLeadRepository.findAll();

        long totalManagers = allManagers.size();
        long totalEmployees = allAdvisors.size();
        long totalLeads = allLeads.size();

        // 2. Active Customers (Policies Sold / Issued)
        long policiesSold = allLeads.stream()
                .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()) || "WON".equalsIgnoreCase(l.getStage()))
                .count();

        long activeCustomers = policiesSold;

        // 3. Time boundaries
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDateTime now = LocalDateTime.now();

        // 4. Daily Telemetry
        long callsToday = callLogRepository.countAllCallsToday(startOfDay);
        long meetingsToday = clientMeetingRepository.countAllMeetingsToday(startOfDay, endOfDay);
        long overdueFollowups = followUpTaskRepository.countAllOverdue(now);

        // 5. Quotations & Gross Written Premium
        long quotationsCount = allLeads.stream()
                .filter(l -> "QUOTATION".equalsIgnoreCase(l.getStage()) || "MEETING".equalsIgnoreCase(l.getStage()) || 
                             "DOCUMENTS".equalsIgnoreCase(l.getStage()) || "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) ||
                             "CONVERTED".equalsIgnoreCase(l.getStage()))
                .count();

        double overallConversionRate = totalLeads > 0
                ? BigDecimal.valueOf(((double) policiesSold / totalLeads) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        BigDecimal totalGwp = allLeads.stream()
                .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                .map(l -> l.getEstimatedPremium() != null ? l.getEstimatedPremium() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 6. Manager Performance Leaderboard
        List<com.aadhiraksha.insurance.dto.AdminAnalyticsDto.ManagerLeaderboardDto> managerLeaderboard = new ArrayList<>();
        for (User mgr : allManagers) {
            List<User> team = userRepository.findByManagerId(mgr.getId());
            List<Long> teamIds = team.stream().map(User::getId).collect(Collectors.toList());

            List<ClientLead> mgrLeads = allLeads.stream()
                    .filter(l -> (l.getManager() != null && l.getManager().getId().equals(mgr.getId())) ||
                                 (l.getAssignedAdvisor() != null && teamIds.contains(l.getAssignedAdvisor().getId())))
                    .collect(Collectors.toList());

            long mgrCallsToday = 0;
            for (Long advId : teamIds) {
                mgrCallsToday += callLogRepository.countCallsTodayForAdvisor(advId, startOfDay);
            }

            long mgrOverdue = followUpTaskRepository.findOverdueForManager(mgr.getId(), now).size();
            long mgrSold = mgrLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .count();

            double mgrConv = !mgrLeads.isEmpty()
                    ? BigDecimal.valueOf(((double) mgrSold / mgrLeads.size()) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            BigDecimal mgrPremium = mgrLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .map(l -> l.getEstimatedPremium() != null ? l.getEstimatedPremium() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String branch = "Hyderabad Branch";
            if (mgr.getFullName().contains("Bangalore") || mgr.getFullName().contains("Iyer")) branch = "Bangalore Branch";
            if (mgr.getFullName().contains("Mumbai") || mgr.getFullName().contains("Mehta")) branch = "Mumbai Branch";

            managerLeaderboard.add(com.aadhiraksha.insurance.dto.AdminAnalyticsDto.ManagerLeaderboardDto.builder()
                    .managerId(mgr.getId())
                    .managerName(mgr.getFullName())
                    .branch(branch)
                    .department(mgr.getDepartment() != null ? mgr.getDepartment() : "Retail Insurance")
                    .teamSize(team.size())
                    .totalLeads(mgrLeads.size())
                    .callsToday(mgrCallsToday)
                    .overdueFollowups(mgrOverdue)
                    .policiesSold(mgrSold)
                    .conversionRate(mgrConv)
                    .totalPremiumVolume(mgrPremium)
                    .build());
        }

        managerLeaderboard.sort((a, b) -> Long.compare(b.getPoliciesSold(), a.getPoliciesSold()));

        // 7. Top Advisor Performers (Company-wide)
        List<ManagerAnalyticsDto.AdvisorPerformanceDto> topAdvisors = new ArrayList<>();
        for (User adv : allAdvisors) {
            List<ClientLead> advLeads = allLeads.stream()
                    .filter(l -> l.getAssignedAdvisor() != null && l.getAssignedAdvisor().getId().equals(adv.getId()))
                    .collect(Collectors.toList());

            long advCalls = callLogRepository.countCallsTodayForAdvisor(adv.getId(), startOfDay);
            long advDue = followUpTaskRepository.findDueTodayForAdvisor(adv.getId(), startOfDay, endOfDay).size();
            long advOverdue = followUpTaskRepository.countOverdueForAdvisor(adv.getId(), now);
            long advMeetings = clientMeetingRepository.countMeetingsTodayForAdvisor(adv.getId(), startOfDay, endOfDay);
            long advSold = advLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .count();
            long advQuotes = advLeads.stream()
                    .filter(l -> "QUOTATION".equalsIgnoreCase(l.getStage()) || "MEETING".equalsIgnoreCase(l.getStage()))
                    .count();

            double advConv = !advLeads.isEmpty()
                    ? BigDecimal.valueOf(((double) advSold / advLeads.size()) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            BigDecimal advPrem = advLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .map(l -> l.getEstimatedPremium() != null ? l.getEstimatedPremium() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String designation = adv.getStaffProfile() != null && adv.getStaffProfile().getDesignationName() != null
                    ? adv.getStaffProfile().getDesignationName()
                    : "Senior Advisor";

            topAdvisors.add(ManagerAnalyticsDto.AdvisorPerformanceDto.builder()
                    .advisorId(adv.getId())
                    .advisorName(adv.getFullName())
                    .email(adv.getEmail())
                    .employeeCode(adv.getEmployeeCode() != null ? adv.getEmployeeCode() : "EMP-" + adv.getId())
                    .designation(designation)
                    .isActive(adv.getIsActive() != null ? adv.getIsActive() : true)
                    .totalLeads(advLeads.size())
                    .callsToday(advCalls)
                    .followupsDueToday(advDue)
                    .overdueFollowups(advOverdue)
                    .meetingsScheduled(advMeetings)
                    .quotationsCount(advQuotes)
                    .policiesSold(advSold)
                    .conversionRate(advConv)
                    .totalPremiumVolume(advPrem)
                    .build());
        }
        topAdvisors.sort((a, b) -> Long.compare(b.getPoliciesSold(), a.getPoliciesSold()));

        // 8. Lead Source Performance
        Map<String, String> sourceNames = new LinkedHashMap<>();
        sourceNames.put("DIRECT_ENTRY", "Web Portal Direct Inquiries");
        sourceNames.put("POSP_REFERRAL", "POSP Partner Network");
        sourceNames.put("WHATSAPP_CAMPAIGN", "WhatsApp & Digital Campaigns");
        sourceNames.put("HOSPITAL_DESK", "Cashless Hospital Helpdesks");
        sourceNames.put("RENEWAL_PORTAL", "Policy Renewal Follow-ups");

        List<com.aadhiraksha.insurance.dto.AdminAnalyticsDto.LeadSourcePerformanceDto> sourceMetrics = new ArrayList<>();
        for (Map.Entry<String, String> entry : sourceNames.entrySet()) {
            List<ClientLead> srcLeads = allLeads.stream()
                    .filter(l -> entry.getKey().equalsIgnoreCase(l.getLeadSource()) || 
                                 ("DIRECT_ENTRY".equals(entry.getKey()) && (l.getLeadSource() == null || "WEB_PORTAL".equalsIgnoreCase(l.getLeadSource()))))
                    .collect(Collectors.toList());

            long srcCount = srcLeads.size();
            long srcSold = srcLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .count();

            double srcConv = srcCount > 0
                    ? BigDecimal.valueOf(((double) srcSold / srcCount) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            BigDecimal srcPremium = srcLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .map(l -> l.getEstimatedPremium() != null ? l.getEstimatedPremium() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double share = totalLeads > 0 ? ((double) srcCount / totalLeads) * 100 : 0.0;

            sourceMetrics.add(com.aadhiraksha.insurance.dto.AdminAnalyticsDto.LeadSourcePerformanceDto.builder()
                    .sourceKey(entry.getKey())
                    .sourceLabel(entry.getValue())
                    .leadCount(srcCount)
                    .convertedCount(srcSold)
                    .conversionRate(srcConv)
                    .totalPremium(srcPremium)
                    .percentageShare(BigDecimal.valueOf(share).setScale(1, RoundingMode.HALF_UP).doubleValue())
                    .build());
        }

        // 9. Insurance Product Performance
        Map<String, String> productCategories = new LinkedHashMap<>();
        productCategories.put("Health Insurance", "Health & Critical Illness");
        productCategories.put("Motor Insurance", "Motor & Commercial Vehicle");
        productCategories.put("Life Insurance", "Term & Life Insurance");
        productCategories.put("SME & Business", "SME & Commercial Liability");
        productCategories.put("Travel Insurance", "International Travel");

        List<com.aadhiraksha.insurance.dto.AdminAnalyticsDto.ProductPerformanceDto> productMetrics = new ArrayList<>();
        for (Map.Entry<String, String> entry : productCategories.entrySet()) {
            List<ClientLead> prodLeads = allLeads.stream()
                    .filter(l -> l.getInsuranceType() != null && l.getInsuranceType().toLowerCase().contains(entry.getKey().toLowerCase().split(" ")[0]))
                    .collect(Collectors.toList());

            long pCount = prodLeads.size();
            long pSold = prodLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .count();

            double pConv = pCount > 0
                    ? BigDecimal.valueOf(((double) pSold / pCount) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            BigDecimal pPremium = prodLeads.stream()
                    .filter(l -> "POLICY_ISSUED".equalsIgnoreCase(l.getStage()) || "CONVERTED".equalsIgnoreCase(l.getStage()))
                    .map(l -> l.getEstimatedPremium() != null ? l.getEstimatedPremium() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double pShare = totalLeads > 0 ? ((double) pCount / totalLeads) * 100 : 0.0;

            productMetrics.add(com.aadhiraksha.insurance.dto.AdminAnalyticsDto.ProductPerformanceDto.builder()
                    .productCategory(entry.getValue())
                    .leadCount(pCount)
                    .policiesSold(pSold)
                    .conversionRate(pConv)
                    .totalPremium(pPremium)
                    .percentageShare(BigDecimal.valueOf(pShare).setScale(1, RoundingMode.HALF_UP).doubleValue())
                    .build());
        }

        // 10. 6-Month Rolling Monthly Conversion Trend
        List<com.aadhiraksha.insurance.dto.AdminAnalyticsDto.MonthlyTrendDto> monthlyTrends = new ArrayList<>();
        String[] months = {"Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"};
        long[] mockLeads = {120, 180, 240, 310, 420, Math.max(totalLeads, 12)};
        long[] mockSold = {18, 26, 38, 49, 68, Math.max(policiesSold, 3)};

        for (int i = 0; i < months.length; i++) {
            long mLead = mockLeads[i];
            long mSold = mockSold[i];
            double mConv = mLead > 0 ? BigDecimal.valueOf(((double) mSold / mLead) * 100).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0;
            BigDecimal mGwp = BigDecimal.valueOf(mSold * 28500.0);

            monthlyTrends.add(com.aadhiraksha.insurance.dto.AdminAnalyticsDto.MonthlyTrendDto.builder()
                    .month(months[i])
                    .newLeads(mLead)
                    .policiesSold(mSold)
                    .conversionRate(mConv)
                    .grossWrittenPremium(mGwp)
                    .build());
        }

        return com.aadhiraksha.insurance.dto.AdminAnalyticsDto.SuperAdminDashboardResponse.builder()
                .totalManagers(totalManagers)
                .totalEmployees(totalEmployees)
                .totalLeads(totalLeads)
                .activeCustomers(activeCustomers)
                .callsToday(callsToday)
                .meetingsToday(meetingsToday)
                .overdueFollowups(overdueFollowups)
                .quotationsGenerated(quotationsCount)
                .policiesSold(policiesSold)
                .overallConversionRate(overallConversionRate)
                .totalGwpGenerated(totalGwp)
                .managerPerformance(managerLeaderboard)
                .topAdvisorPerformers(topAdvisors)
                .leadSourcePerformance(sourceMetrics)
                .productPerformance(productMetrics)
                .monthlyConversionTrend(monthlyTrends)
                .build();
    }
}
