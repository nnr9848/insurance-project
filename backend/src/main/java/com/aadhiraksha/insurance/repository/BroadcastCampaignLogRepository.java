package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.BroadcastCampaignLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BroadcastCampaignLogRepository extends JpaRepository<BroadcastCampaignLog, Long> {
    List<BroadcastCampaignLog> findAllByOrderByCreatedAtDesc();
}
