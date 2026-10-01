package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.PospCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PospCommissionRepository extends JpaRepository<PospCommission, Long> {

    List<PospCommission> findByPospAgentIdOrderByCreatedAtDesc(Long agentId);

    List<PospCommission> findByPospAgentIdAndPayoutStatusOrderByCreatedAtDesc(Long agentId, String payoutStatus);

    @Query("SELECT COALESCE(SUM(c.grossPremium), 0) FROM PospCommission c WHERE c.pospAgent.id = :agentId")
    BigDecimal getTotalGrossPremiumForAgent(@Param("agentId") Long agentId);

    @Query("SELECT COALESCE(SUM(c.netPayout), 0) FROM PospCommission c WHERE c.pospAgent.id = :agentId")
    BigDecimal getTotalEarningsForAgent(@Param("agentId") Long agentId);

    @Query("SELECT COALESCE(SUM(c.netPayout), 0) FROM PospCommission c WHERE c.pospAgent.id = :agentId AND c.payoutStatus = 'PAID'")
    BigDecimal getTotalPaidForAgent(@Param("agentId") Long agentId);

    @Query("SELECT COALESCE(SUM(c.netPayout), 0) FROM PospCommission c WHERE c.pospAgent.id = :agentId AND c.payoutStatus IN ('PENDING', 'PROCESSED')")
    BigDecimal getPendingPayoutForAgent(@Param("agentId") Long agentId);

    @Query("SELECT COUNT(c) FROM PospCommission c WHERE c.pospAgent.id = :agentId")
    Long countPoliciesSoldByAgent(@Param("agentId") Long agentId);
}
