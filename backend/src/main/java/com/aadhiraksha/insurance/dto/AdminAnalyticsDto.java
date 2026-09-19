package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class AdminAnalyticsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuperAdminDashboardResponse {
        // 9 Primary Executive KPI Cards
        private long totalManagers;
        private long totalEmployees;
        private long totalLeads;
        private long activeCustomers;
        private long callsToday;
        private long meetingsToday;
        private long overdueFollowups;
        private long quotationsGenerated;
        private long policiesSold;
        private double overallConversionRate;
        private BigDecimal totalGwpGenerated;

        // 4 Executive Deep Performance Matrix Panels
        private List<ManagerLeaderboardDto> managerPerformance;
        private List<ManagerAnalyticsDto.AdvisorPerformanceDto> topAdvisorPerformers;
        private List<LeadSourcePerformanceDto> leadSourcePerformance;
        private List<ProductPerformanceDto> productPerformance;
        private List<MonthlyTrendDto> monthlyConversionTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerLeaderboardDto {
        private Long managerId;
        private String managerName;
        private String branch;
        private String department;
        private int teamSize;
        private long totalLeads;
        private long callsToday;
        private long overdueFollowups;
        private long policiesSold;
        private double conversionRate;
        private BigDecimal totalPremiumVolume;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeadSourcePerformanceDto {
        private String sourceKey;
        private String sourceLabel;
        private long leadCount;
        private long convertedCount;
        private double conversionRate;
        private BigDecimal totalPremium;
        private double percentageShare;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPerformanceDto {
        private String productCategory;
        private long leadCount;
        private long policiesSold;
        private double conversionRate;
        private BigDecimal totalPremium;
        private double percentageShare;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendDto {
        private String month;
        private long newLeads;
        private long policiesSold;
        private double conversionRate;
        private BigDecimal grossWrittenPremium;
    }
}
