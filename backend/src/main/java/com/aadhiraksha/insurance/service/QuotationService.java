package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.QuotationDto;
import com.aadhiraksha.insurance.model.ClientLead;
import com.aadhiraksha.insurance.model.Quotation;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClientLeadRepository;
import com.aadhiraksha.insurance.repository.QuotationRepository;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final ClientLeadRepository clientLeadRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    @Transactional
    public QuotationDto.Response createQuotation(QuotationDto.Request request, String advisorEmail) {
        ClientLead client = clientLeadRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        User advisor = userRepository.findByEmail(advisorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Advisor user not found"));

        // Generate Unique Quote Number
        String quoteNumber = "QT-" + LocalDateTime.now().getYear() + "-" + String.format("%05d", (int)(Math.random() * 90000) + 10000);

        // Tax Calculation (18% Standard Insurance GST)
        BigDecimal base = request.getBasePremium();
        BigDecimal taxGst = base.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = base.add(taxGst).setScale(2, RoundingMode.HALF_UP);

        Quotation quotation = Quotation.builder()
                .quoteNumber(quoteNumber)
                .client(client)
                .createdByAdvisor(advisor)
                .insuranceType(request.getInsuranceType())
                .insurerName(request.getInsurerName())
                .planName(request.getPlanName())
                .planVariant(request.getPlanVariant())
                .sumInsured(request.getSumInsured())
                .policyTenureYears(request.getPolicyTenureYears() != null ? request.getPolicyTenureYears() : 1)
                .basePremium(base)
                .taxGst(taxGst)
                .totalPremium(total)
                .ncbDiscountPercent(request.getNcbDiscountPercent() != null ? request.getNcbDiscountPercent() : BigDecimal.ZERO)
                .roomRentLimit(request.getRoomRentLimit() != null ? request.getRoomRentLimit() : "No Cap / Single Private Room")
                .copayPercentage(request.getCopayPercentage() != null ? request.getCopayPercentage() : "0%")
                .restorationBenefit(request.getRestorationBenefit() != null ? request.getRestorationBenefit() : "100% Unlimited Recharge")
                .prePostHospitalization(request.getPrePostHospitalization() != null ? request.getPrePostHospitalization() : "60 Days Pre / 180 Days Post")
                .maternityCovered(Boolean.TRUE.equals(request.getMaternityCovered()))
                .opdCovered(Boolean.TRUE.equals(request.getOpdCovered()))
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .versionNumber(1)
                .notes(request.getNotes())
                .build();

        Quotation saved = quotationRepository.save(quotation);

        // Audit Trail Record
        auditService.logAction(
                "Client",
                client.getId(),
                "CREATE",
                "Quotation Created",
                null,
                "Quote " + saved.getQuoteNumber() + " (" + saved.getInsurerName() + " - " + saved.getPlanName() + ") for ₹" + saved.getTotalPremium(),
                advisor.getId(),
                advisor.getFullName(),
                null
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<QuotationDto.Response> getQuotationsForClient(Long clientId) {
        return quotationRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuotationDto.Response> getQuotationsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isSuperAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SUPER_ADMIN") || r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));

        List<Quotation> list;
        if (isSuperAdmin) {
            list = quotationRepository.findAllByOrderByCreatedAtDesc();
        } else if (isManager) {
            list = quotationRepository.findByManagerId(user.getId());
        } else {
            list = quotationRepository.findByCreatedByAdvisorIdOrderByCreatedAtDesc(user.getId());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public QuotationDto.Response updateQuotationStatus(Long quoteId, String newStatus, String userEmail) {
        Quotation quotation = quotationRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Quotation not found with ID: " + quoteId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldStatus = quotation.getStatus();
        quotation.setStatus(newStatus);
        Quotation saved = quotationRepository.save(quotation);

        // Audit Trail Record
        auditService.logAction(
                "Quotation",
                saved.getId(),
                "STATUS_CHANGE",
                "quote_status",
                oldStatus,
                newStatus,
                user.getId(),
                user.getFullName(),
                null
        );

        return mapToResponse(saved);
    }

    @Transactional
    public Map<String, Object> sendQuotation(Long quoteId, QuotationDto.SendQuoteRequest sendRequest, String userEmail) {
        Quotation quotation = quotationRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Quotation not found with ID: " + quoteId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ClientLead client = quotation.getClient();
        String targetPhone = sendRequest.getRecipientPhone() != null ? sendRequest.getRecipientPhone() : client.getPhoneNumber();

        // Mark quote as SENT
        quotation.setStatus("SENT");
        quotationRepository.save(quotation);

        // Build WhatsApp Dispatch Link
        String text = "🛡️ *Aadhiraksha InsurTech - Formal Insurance Quotation*\n\n" +
                "Dear " + client.getFullName() + ",\n" +
                "Here is the detailed quotation prepared for your " + quotation.getInsuranceType().replace('_', ' ') + " requirements:\n\n" +
                "📋 *Quote Reference:* " + quotation.getQuoteNumber() + "\n" +
                "🏢 *Insurer:* " + quotation.getInsurerName() + "\n" +
                "🌟 *Plan Name:* " + quotation.getPlanName() + " (" + (quotation.getPlanVariant() != null ? quotation.getPlanVariant() : "Comprehensive") + ")\n" +
                "🛡️ *Sum Insured:* " + quotation.getSumInsured() + "\n" +
                "💰 *Total Premium (incl. GST):* ₹" + quotation.getTotalPremium() + " / year\n" +
                "🏥 *Room Rent Limit:* " + quotation.getRoomRentLimit() + "\n" +
                "⚡ *Restoration Benefit:* " + quotation.getRestorationBenefit() + "\n" +
                "✨ *Pre/Post Hospitalization:* " + quotation.getPrePostHospitalization() + "\n\n" +
                "To review the comparative breakdown or approve this quotation, please connect with your specialist:\n" +
                "👤 *Advisor:* " + user.getFullName() + "\n" +
                "📞 *Contact:* " + (user.getPhoneNumber() != null ? user.getPhoneNumber() : "+91 98480 12345");

        String cleanPhone = targetPhone.replaceAll("[^0-9]", "");
        String waUrl = "https://wa.me/" + cleanPhone + "?text=" + java.net.URLEncoder.encode(text, java.nio.charset.StandardCharsets.UTF_8);

        // Audit Trail
        auditService.logAction(
                "Client",
                client.getId(),
                "CALL_LOG",
                "Quotation Dispatched",
                null,
                "Dispatched Quote " + quotation.getQuoteNumber() + " via WhatsApp to " + cleanPhone,
                user.getId(),
                user.getFullName(),
                null
        );

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("quoteNumber", quotation.getQuoteNumber());
        res.put("status", "SENT");
        res.put("whatsAppUrl", waUrl);
        res.put("dispatchedTo", cleanPhone);
        return res;
    }

    private QuotationDto.Response mapToResponse(Quotation q) {
        return QuotationDto.Response.builder()
                .id(q.getId())
                .quoteNumber(q.getQuoteNumber())
                .clientId(q.getClient() != null ? q.getClient().getId() : null)
                .clientName(q.getClient() != null ? q.getClient().getFullName() : "Unknown")
                .clientPhone(q.getClient() != null ? q.getClient().getPhoneNumber() : "")
                .clientEmail(q.getClient() != null ? q.getClient().getEmail() : "")
                .createdByAdvisorId(q.getCreatedByAdvisor() != null ? q.getCreatedByAdvisor().getId() : null)
                .createdByAdvisorName(q.getCreatedByAdvisor() != null ? q.getCreatedByAdvisor().getFullName() : "System")
                .insuranceType(q.getInsuranceType())
                .insurerName(q.getInsurerName())
                .planName(q.getPlanName())
                .planVariant(q.getPlanVariant())
                .sumInsured(q.getSumInsured())
                .policyTenureYears(q.getPolicyTenureYears())
                .basePremium(q.getBasePremium())
                .taxGst(q.getTaxGst())
                .totalPremium(q.getTotalPremium())
                .ncbDiscountPercent(q.getNcbDiscountPercent())
                .roomRentLimit(q.getRoomRentLimit())
                .copayPercentage(q.getCopayPercentage())
                .restorationBenefit(q.getRestorationBenefit())
                .prePostHospitalization(q.getPrePostHospitalization())
                .maternityCovered(q.getMaternityCovered())
                .opdCovered(q.getOpdCovered())
                .status(q.getStatus())
                .versionNumber(q.getVersionNumber())
                .notes(q.getNotes())
                .brochureUrl(q.getBrochureUrl())
                .createdAt(q.getCreatedAt())
                .updatedAt(q.getUpdatedAt())
                .build();
    }
}
