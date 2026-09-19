package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class ManagerAnalyticsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerDashboardResponse {
        // Manager Profile Info
        private Long managerId;
        private String managerName;
        private String branch;
        private String department;
        private int teamSize;

        // KPI Summary Cards
        private long totalLeads;
        private long callsToday;
        private long followupsDueToday;
        private long overdueFollowups;
        private long meetingsToday;
        private long quotationsCount;
        private long policiesSold;
        private double conversionRate;
        private BigDecimal totalPremiumGenerated;
        private BigDecimal targetPremium;
        private double targetAchievementPercentage;

        // Advisor Performance Matrix
        private List<AdvisorPerformanceDto> teamPerformance;

        // Stage Distribution for Team
        private List<PipelineStageCountDto> pipelineBreakdown;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvisorPerformanceDto {
        private Long advisorId;
        private String advisorName;
        private String email;
        private String employeeCode;
        private String designation;
        private boolean isActive;
        private long totalLeads;
        private long callsToday;
        private long followupsDueToday;
        private long overdueFollowups;
        private long meetingsScheduled;
        private long quotationsCount;
        private long policiesSold;
        private double conversionRate;
        private BigDecimal totalPremiumVolume;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PipelineStageCountDto {
        private String stage;
        private String label;
        private long count;
    }
}
