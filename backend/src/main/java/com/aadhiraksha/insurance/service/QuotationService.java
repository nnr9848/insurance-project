package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.dto.QuotationDto;
import com.aadhiraksha.insurance.model.Client;
import com.aadhiraksha.insurance.model.QuoteInquiry;
import com.aadhiraksha.insurance.model.Quotation;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.ClientRepository;
import com.aadhiraksha.insurance.repository.QuoteInquiryRepository;
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
    private final ClientRepository clientRepository;
    private final QuoteInquiryRepository quoteInquiryRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    @Transactional
    public QuotationDto.Response createQuotation(QuotationDto.Request request, String advisorEmail) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + request.getClientId()));

        User advisor = userRepository.findByEmail(advisorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Advisor user not found"));

        // Match or resolve QuoteInquiry link
        QuoteInquiry inquiry = null;
        if (request.getInquiryId() != null) {
            inquiry = quoteInquiryRepository.findById(request.getInquiryId()).orElse(null);
        } else if (client.getPhoneNumber() != null && !client.getPhoneNumber().isBlank()) {
            String digits = client.getPhoneNumber().replaceAll("[^0-9]", "");
            String suffix = digits.length() >= 10 ? digits.substring(digits.length() - 10) : digits;
            if (!suffix.isEmpty()) {
                List<QuoteInquiry> matched = quoteInquiryRepository.findByPhoneSuffix(suffix);
                if (!matched.isEmpty()) {
                    inquiry = matched.get(0);
                }
            }
        }

        // Generate Unique Quote Number
        String quoteNumber = "QT-" + LocalDateTime.now().getYear() + "-" + String.format("%05d", (int)(Math.random() * 90000) + 10000);

        // Tax Calculation (18% Standard Insurance GST)
        BigDecimal base = request.getBasePremium();
        BigDecimal taxGst = base.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = base.add(taxGst).setScale(2, RoundingMode.HALF_UP);

        Quotation quotation = Quotation.builder()
                .quoteNumber(quoteNumber)
                .client(client)
                .inquiry(inquiry)
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
                .maternityCovered(request.getMaternityCovered() != null ? request.getMaternityCovered() : false)
                .opdCovered(request.getOpdCovered() != null ? request.getOpdCovered() : false)
                .status("DRAFT")
                .versionNumber(1)
                .notes(request.getNotes())
                .brochureUrl(request.getBrochureUrl())
                .build();

        Quotation saved = quotationRepository.save(quotation);

        // Advance Client CRM stage to QUOTATION if previously in earlier stage
        if ("NEW_LEAD".equals(client.getStage()) || "CONTACTED".equals(client.getStage()) || "FOLLOWUP".equals(client.getStage()) || "INTERESTED".equals(client.getStage())) {
            client.setStage("QUOTATION");
            clientRepository.save(client);
        }

        // Audit Trail
        auditService.logAction(
                "Client",
                client.getId(),
                "CREATE",
                "Quotation Created",
                null,
                "Generated Quote " + saved.getQuoteNumber() + " (" + saved.getInsurerName() + " - " + saved.getPlanName() + ")",
                advisor,
                null
        );

        return mapToResponse(saved);
    }

    @Transactional
    public QuotationDto.Response updateQuotation(Long quoteId, QuotationDto.Request request, String userEmail) {
        Quotation quotation = quotationRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Quotation not found with ID: " + quoteId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        // Recalculate financial breakdown
        BigDecimal base = request.getBasePremium() != null ? request.getBasePremium() : quotation.getBasePremium();
        BigDecimal taxGst = base.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = base.add(taxGst).setScale(2, RoundingMode.HALF_UP);

        quotation.setInsuranceType(request.getInsuranceType() != null ? request.getInsuranceType() : quotation.getInsuranceType());
        quotation.setInsurerName(request.getInsurerName() != null ? request.getInsurerName() : quotation.getInsurerName());
        quotation.setPlanName(request.getPlanName() != null ? request.getPlanName() : quotation.getPlanName());
        quotation.setPlanVariant(request.getPlanVariant() != null ? request.getPlanVariant() : quotation.getPlanVariant());
        quotation.setSumInsured(request.getSumInsured() != null ? request.getSumInsured() : quotation.getSumInsured());
        quotation.setPolicyTenureYears(request.getPolicyTenureYears() != null ? request.getPolicyTenureYears() : quotation.getPolicyTenureYears());
        quotation.setBasePremium(base);
        quotation.setTaxGst(taxGst);
        quotation.setTotalPremium(total);
        quotation.setNcbDiscountPercent(request.getNcbDiscountPercent() != null ? request.getNcbDiscountPercent() : quotation.getNcbDiscountPercent());
        quotation.setRoomRentLimit(request.getRoomRentLimit() != null ? request.getRoomRentLimit() : quotation.getRoomRentLimit());
        quotation.setCopayPercentage(request.getCopayPercentage() != null ? request.getCopayPercentage() : quotation.getCopayPercentage());
        quotation.setRestorationBenefit(request.getRestorationBenefit() != null ? request.getRestorationBenefit() : quotation.getRestorationBenefit());
        quotation.setPrePostHospitalization(request.getPrePostHospitalization() != null ? request.getPrePostHospitalization() : quotation.getPrePostHospitalization());
        quotation.setMaternityCovered(request.getMaternityCovered() != null ? request.getMaternityCovered() : quotation.getMaternityCovered());
        quotation.setOpdCovered(request.getOpdCovered() != null ? request.getOpdCovered() : quotation.getOpdCovered());
        quotation.setNotes(request.getNotes() != null ? request.getNotes() : quotation.getNotes());
        quotation.setBrochureUrl(request.getBrochureUrl() != null ? request.getBrochureUrl() : quotation.getBrochureUrl());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            quotation.setStatus(request.getStatus().toUpperCase());
        }
        quotation.setVersionNumber(quotation.getVersionNumber() != null ? quotation.getVersionNumber() + 1 : 1);

        Quotation saved = quotationRepository.save(quotation);

        auditService.logAction(
                "Client",
                quotation.getClient().getId(),
                "UPDATE",
                "Quotation Revised",
                "v" + (saved.getVersionNumber() - 1),
                "v" + saved.getVersionNumber() + " (" + saved.getQuoteNumber() + ")",
                user,
                null
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<QuotationDto.Response> getQuotations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

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

    @Transactional(readOnly = true)
    public List<QuotationDto.Response> getClientQuotations(Long clientId) {
        return quotationRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuotationDto.Response updateQuoteStatus(Long quoteId, String newStatus, String userEmail) {
        Quotation quotation = quotationRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Quotation not found with ID: " + quoteId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldStatus = quotation.getStatus();
        quotation.setStatus(newStatus.toUpperCase());
        Quotation updated = quotationRepository.save(quotation);

        // Audit Trail
        auditService.logAction(
                "Client",
                quotation.getClient().getId(),
                "UPDATE",
                "Quotation Status",
                oldStatus,
                updated.getStatus(),
                user,
                null
        );

        return mapToResponse(updated);
    }

    @Transactional
    public Map<String, Object> sendQuoteDispatch(Long quoteId, QuotationDto.SendQuoteRequest sendRequest, String userEmail) {
        Quotation quotation = quotationRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Quotation not found with ID: " + quoteId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Client client = quotation.getClient();
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

        String cleanPhone = formatWhatsAppNumber(targetPhone);
        String waUrl = "https://wa.me/" + cleanPhone + "?text=" + java.net.URLEncoder.encode(text, java.nio.charset.StandardCharsets.UTF_8);

        // Audit Trail
        auditService.logAction(
                "Client",
                client.getId(),
                "CALL_LOG",
                "Quotation Dispatched",
                null,
                "Dispatched Quote " + quotation.getQuoteNumber() + " via WhatsApp to " + cleanPhone,
                user,
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

    public static String formatWhatsAppNumber(String phone) {
        if (phone == null || phone.isBlank()) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        digits = digits.replaceFirst("^0+", "");
        if (digits.length() == 10) {
            return "91" + digits;
        }
        return digits;
    }

    private QuotationDto.Response mapToResponse(Quotation q) {
        return QuotationDto.Response.builder()
                .id(q.getId())
                .quoteNumber(q.getQuoteNumber())
                .clientId(q.getClient() != null ? q.getClient().getId() : null)
                .clientName(q.getClient() != null ? q.getClient().getFullName() : "Unknown")
                .clientPhone(q.getClient() != null ? q.getClient().getPhoneNumber() : "")
                .clientEmail(q.getClient() != null ? q.getClient().getEmail() : "")
                .inquiryId(q.getInquiry() != null ? q.getInquiry().getId() : null)
                .inquiryCategorySlug(q.getInquiry() != null ? q.getInquiry().getCategorySlug() : null)
                .inquiryStatus(q.getInquiry() != null ? q.getInquiry().getStatus() : null)
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
