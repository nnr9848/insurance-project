package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdvisorAnalyticsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvisorDashboardResponse {
        // Advisor Profile Info
        private Long advisorId;
        private String advisorName;
        private String email;
        private String designation;
        private String branch;
        private String managerName;

        // Top 7 Primary KPI Counters
        private long callsToday;
        private long overdueFollowups;
        private long meetingsToday;
        private long newLeads;
        private long interestedClients;
        private long quotationPending;
        private long policiesClosedMonth;

        // Financial & Target Metrics
        private BigDecimal monthlyTargetPremium;
        private BigDecimal monthlyAchievedPremium;
        private double targetAchievementPercentage;
        private double conversionRate;

        // Section 2: Today's Follow-ups
        private List<TodayFollowUpDto> todayFollowUps;

        // Section 3: Upcoming Meetings
        private List<UpcomingMeetingDto> upcomingMeetings;

        // Section 4: My Sales Pipeline Breakdown
        private List<PipelineStageSummaryDto> pipelineBreakdown;

        // Section 5: Recent Client Activity
        private List<RecentActivityDto> recentActivities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodayFollowUpDto {
        private Long followUpId;
        private Long clientId;
        private String clientName;
        private String phoneNumber;
        private String email;
        private String policyCategory;
        private String priority;
        private String stage;
        private LocalDateTime scheduledTime;
        private String remarks;
        private boolean isOverdue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingMeetingDto {
        private Long meetingId;
        private Long clientId;
        private String clientName;
        private String phoneNumber;
        private String title;
        private String meetingType; // GOOGLE_MEET, IN_PERSON, PHONE_CALL
        private String meetingLink;
        private String location;
        private LocalDateTime scheduledStartTime;
        private LocalDateTime scheduledEndTime;
        private String status;
        private String agenda;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PipelineStageSummaryDto {
        private String stage;
        private String label;
        private long count;
        private BigDecimal totalPotentialValue;
        private String badgeColor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityDto {
        private String activityType; // CALL_LOG, MEETING, STAGE_CHANGE, QUOTE_CREATED, DOCUMENT_UPLOAD
        private Long clientId;
        private String clientName;
        private String description;
        private String outcome;
        private LocalDateTime timestamp;
        private String iconType;
    }
}
