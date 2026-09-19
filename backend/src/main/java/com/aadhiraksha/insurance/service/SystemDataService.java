package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.*;
import com.aadhiraksha.insurance.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemDataService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClientLeadRepository clientLeadRepository;
    private final QuotationRepository quotationRepository;
    private final ClientDocumentRepository documentRepository;
    private final ApprovalRequestRepository approvalRepository;
    private final CallLogRepository callLogRepository;
    private final FollowUpTaskRepository followUpRepository;
    private final ClientMeetingRepository meetingRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Transactional
    public Map<String, Object> purgeDemoData() {
        log.info("Initiating on-demand purge of all demo data...");

        // Safe cascading delete in strict FK order using batch deletes + flush
        approvalRepository.deleteAllInBatch();
        documentRepository.deleteAllInBatch();
        quotationRepository.deleteAllInBatch();
        callLogRepository.deleteAllInBatch();
        followUpRepository.deleteAllInBatch();
        meetingRepository.deleteAllInBatch();
        clientLeadRepository.deleteAllInBatch();
        entityManager.flush();
        entityManager.clear();

        log.info("Demo CRM transactional data purged cleanly.");
        return Map.of(
                "status", "SUCCESS",
                "message", "All sample CRM leads, quotations, approvals, call logs, and documents have been purged cleanly.",
                "purgedAt", LocalDateTime.now().toString()
        );
    }

    @Transactional
    public Map<String, Object> seedRealisticDemoData() {
        log.info("Initiating realistic enterprise demo data seeding...");

        // 1. Purge existing sample CRM transactional data first to prevent duplication
        purgeDemoData();

        // 2. Fetch/Ensure Organizational Hierarchy
        Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_MANAGER").build()));
        Role advisorRole = roleRepository.findByName("ROLE_ADVISOR")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADVISOR").build()));

        User manager = userRepository.findByEmail("manager@aadhiraksha.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .employeeCode("MGR101")
                        .fullName("Suresh Reddy")
                        .email("manager@aadhiraksha.com")
                        .phoneNumber("+91 9848022338")
                        .password(passwordEncoder.encode("Manager@12345"))
                        .designation("Senior Branch Manager")
                        .department("Retail & Corporate Sales")
                        .roles(new HashSet<>(Collections.singletonList(managerRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build()));

        User advisor1 = userRepository.findByEmail("advisor@aadhiraksha.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .employeeCode("ADV201")
                        .fullName("Rajesh Kumar")
                        .email("advisor@aadhiraksha.com")
                        .phoneNumber("+91 9988776655")
                        .password(passwordEncoder.encode("Advisor@12345"))
                        .designation("Insurance Advisor (Health & Motor)")
                        .department("Retail Sales")
                        .manager(manager)
                        .roles(new HashSet<>(Collections.singletonList(advisorRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build()));

        User advisor2 = userRepository.findByEmail("priya.advisor@aadhiraksha.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .employeeCode("ADV202")
                        .fullName("Priya Sharma")
                        .email("priya.advisor@aadhiraksha.com")
                        .phoneNumber("+91 9876543210")
                        .password(passwordEncoder.encode("Advisor@12345"))
                        .designation("Senior Insurance Advisor (Life & SME)")
                        .department("Corporate Sales")
                        .manager(manager)
                        .roles(new HashSet<>(Collections.singletonList(advisorRole)))
                        .isActive(true)
                        .mustChangePassword(false)
                        .build()));

        // 3. Seed Realistic Client Leads Across Diverse Insurance Verticals
        // Lead 1: Health Porting (Follow-up)
        ClientLead lead1 = clientLeadRepository.save(ClientLead.builder()
                .clientCode("CL-801245")
                .fullName("Ahmed Ali")
                .companyName("Ali Logistics Pvt Ltd")
                .phoneNumber("+91 9849012345")
                .whatsappNumber("+91 9849012345")
                .email("ahmed.ali@example.com")
                .city("Hyderabad")
                .state("Telangana")
                .pincode("500034")
                .insuranceType("Health Insurance")
                .existingInsurer("Star Health")
                .policyExpiryDate(LocalDate.now().plusDays(22))
                .sumInsured("₹10 Lakhs")
                .estimatedPremium(new BigDecimal("18500.00"))
                .leadSource("WEB_INQUIRY")
                .stage("FOLLOWUP")
                .priority("HIGH")
                .assignedAdvisor(advisor1)
                .manager(manager)
                .notes("Looking for ₹10L Family Floater with zero room rent capping and cumulative bonus portability.")
                .build());

        // Lead 2: High Sum Insured Term Life (Quotation Stage)
        ClientLead lead2 = clientLeadRepository.save(ClientLead.builder()
                .clientCode("CL-801246")
                .fullName("Venkatesh Rao")
                .companyName("VR Software Solutions")
                .phoneNumber("+91 9988112233")
                .whatsappNumber("+91 9988112233")
                .email("v.rao@example.com")
                .city("Hyderabad")
                .state("Telangana")
                .pincode("500081")
                .insuranceType("Term Life Insurance")
                .sumInsured("₹2 Crore")
                .estimatedPremium(new BigDecimal("22400.00"))
                .leadSource("REFERRAL")
                .stage("QUOTATION")
                .priority("HIGH")
                .assignedAdvisor(advisor2)
                .manager(manager)
                .notes("35-year term with Critical Illness rider and accidental death cover.")
                .build());

        // Lead 3: Motor Zero-Depreciation (Meeting Scheduled)
        ClientLead lead3 = clientLeadRepository.save(ClientLead.builder()
                .clientCode("CL-801247")
                .fullName("Dr. Sunita Deshmukh")
                .companyName("Apollo Clinic ECIL")
                .phoneNumber("+91 9849556677")
                .whatsappNumber("+91 9849556677")
                .email("dr.sunita@example.com")
                .city("Hyderabad")
                .state("Telangana")
                .pincode("500062")
                .insuranceType("Vehicle / Motor Insurance")
                .existingInsurer("ICICI Lombard")
                .policyExpiryDate(LocalDate.now().plusDays(6))
                .sumInsured("₹11.5 Lakhs IDV")
                .estimatedPremium(new BigDecimal("12400.00"))
                .leadSource("DIRECT_ENTRY")
                .stage("MEETING")
                .priority("MEDIUM")
                .assignedAdvisor(advisor1)
                .manager(manager)
                .notes("Comprehensive Zero Dep renewal for Hyundai Creta with Engine Protect & Return to Invoice.")
                .build());

        // Lead 4: Corporate Group GMC (Documents Collection)
        ClientLead lead4 = clientLeadRepository.save(ClientLead.builder()
                .clientCode("CL-801248")
                .fullName("Rohan Malhotra")
                .companyName("Nexus FinTech Labs")
                .phoneNumber("+91 9711223344")
                .whatsappNumber("+91 9711223344")
                .email("rohan.m@nexusfin.io")
                .city("Bangalore")
                .state("Karnataka")
                .pincode("560001")
                .insuranceType("Business & SME Insurance")
                .sumInsured("₹5 Lakhs / Employee")
                .estimatedPremium(new BigDecimal("285000.00"))
                .leadSource("INBOUND_CALL")
                .stage("DOCUMENT_COLLECTION")
                .priority("URGENT")
                .assignedAdvisor(advisor2)
                .manager(manager)
                .notes("Group Mediclaim (GMC) for 45 employees including OPD and parents cover.")
                .build());

        // Lead 5: International Travel Shield (New Lead)
        ClientLead lead5 = clientLeadRepository.save(ClientLead.builder()
                .clientCode("CL-801249")
                .fullName("Ananya Iyer")
                .companyName(null)
                .phoneNumber("+91 9822334455")
                .whatsappNumber("+91 9822334455")
                .email("ananya.iyer@gmail.com")
                .city("Chennai")
                .state("Tamil Nadu")
                .pincode("600004")
                .insuranceType("Travel Insurance")
                .sumInsured("$250,000 USD")
                .estimatedPremium(new BigDecimal("4200.00"))
                .leadSource("WEB_INQUIRY")
                .stage("NEW_LEAD")
                .priority("HIGH")
                .assignedAdvisor(advisor1)
                .manager(manager)
                .notes("Schengen Visa multi-trip Europe travel coverage for 21 days.")
                .build());

        // 4. Seed Multi-Insurer Comparative Quotations
        quotationRepository.save(Quotation.builder()
                .quoteNumber("QT-2026-00101")
                .client(lead1)
                .createdByAdvisor(advisor1)
                .insuranceType("HEALTH_INSURANCE")
                .insurerName("Star Health and Allied Insurance")
                .planName("Comprehensive Insurance Plan")
                .planVariant("Gold Floater")
                .sumInsured("₹10,00,000")
                .policyTenureYears(1)
                .basePremium(new BigDecimal("14200.00"))
                .taxGst(new BigDecimal("2556.00"))
                .totalPremium(new BigDecimal("16756.00"))
                .ncbDiscountPercent(new BigDecimal("20.00"))
                .roomRentLimit("Single Private AC Room")
                .copayPercentage("0%")
                .restorationBenefit("100% Unlimited Recharge")
                .prePostHospitalization("60 Days Pre / 90 Days Post")
                .maternityCovered(true)
                .opdCovered(false)
                .status("SENT")
                .versionNumber(1)
                .notes("Preferred choice for maternity & OPD cover with wide hospital network in Hyderabad.")
                .build());

        quotationRepository.save(Quotation.builder()
                .quoteNumber("QT-2026-00102")
                .client(lead1)
                .createdByAdvisor(advisor1)
                .insuranceType("HEALTH_INSURANCE")
                .insurerName("Care Health Insurance")
                .planName("Care Supreme")
                .planVariant("Super Plus")
                .sumInsured("₹10,00,000")
                .policyTenureYears(1)
                .basePremium(new BigDecimal("12800.00"))
                .taxGst(new BigDecimal("2304.00"))
                .totalPremium(new BigDecimal("15104.00"))
                .ncbDiscountPercent(new BigDecimal("50.00"))
                .roomRentLimit("No Room Rent Capping")
                .copayPercentage("0%")
                .restorationBenefit("Unlimited Automatic Recharge")
                .prePostHospitalization("60 Days / 180 Days")
                .maternityCovered(false)
                .opdCovered(false)
                .status("SENT")
                .versionNumber(1)
                .notes("Maximum cumulative bonus up to 500% NCB with zero sub-limits.")
                .build());

        quotationRepository.save(Quotation.builder()
                .quoteNumber("QT-2026-00103")
                .client(lead1)
                .createdByAdvisor(advisor1)
                .insuranceType("HEALTH_INSURANCE")
                .insurerName("HDFC ERGO General Insurance")
                .planName("Optima Secure")
                .planVariant("Global Plus")
                .sumInsured("₹10,00,000")
                .policyTenureYears(1)
                .basePremium(new BigDecimal("15600.00"))
                .taxGst(new BigDecimal("2808.00"))
                .totalPremium(new BigDecimal("18408.00"))
                .ncbDiscountPercent(new BigDecimal("0.00"))
                .roomRentLimit("Any Room Category")
                .copayPercentage("0%")
                .restorationBenefit("2X Cover from Day 1 (20 Lakhs Effective)")
                .prePostHospitalization("60 Days / 180 Days")
                .maternityCovered(false)
                .opdCovered(true)
                .status("DRAFT")
                .versionNumber(1)
                .notes("Includes 4X coverage in 3 years with comprehensive consumable protector.")
                .build());

        // 5. Seed Document Locker KYC & Policy Records
        documentRepository.save(ClientDocument.builder()
                .client(lead1)
                .documentType("AADHAAR")
                .fileName("Aadhaar_Card_AhmedAli_Verified.pdf")
                .fileUrl("https://storage.googleapis.com/aadhiraksha-kyc/sample-aadhaar.pdf")
                .fileSizeBytes(1245000L)
                .fileType("application/pdf")
                .verificationStatus("VERIFIED")
                .uploadedBy(advisor1)
                .verifiedBy(manager)
                .verificationNotes("Aadhaar verified via DigiLocker OTP match.")
                .verifiedAt(LocalDateTime.now().minusDays(1))
                .build());

        documentRepository.save(ClientDocument.builder()
                .client(lead1)
                .documentType("PAN")
                .fileName("PAN_Card_AhmedAli.pdf")
                .fileUrl("https://storage.googleapis.com/aadhiraksha-kyc/sample-pan.pdf")
                .fileSizeBytes(980000L)
                .fileType("application/pdf")
                .verificationStatus("VERIFIED")
                .uploadedBy(advisor1)
                .verifiedBy(manager)
                .verificationNotes("NSDL PAN Active status confirmed.")
                .verifiedAt(LocalDateTime.now().minusDays(1))
                .build());

        documentRepository.save(ClientDocument.builder()
                .client(lead1)
                .documentType("PREVIOUS_POLICY")
                .fileName("Star_Health_Optima_2025_Policy.pdf")
                .fileUrl("https://storage.googleapis.com/aadhiraksha-kyc/sample-policy.pdf")
                .fileSizeBytes(2480000L)
                .fileType("application/pdf")
                .verificationStatus("VERIFIED")
                .uploadedBy(advisor1)
                .verifiedBy(manager)
                .verificationNotes("No claim history in past 2 years. 20% NCB eligible.")
                .verifiedAt(LocalDateTime.now().minusDays(1))
                .build());

        documentRepository.save(ClientDocument.builder()
                .client(lead4)
                .documentType("GST_CERTIFICATE")
                .fileName("Nexus_FinTech_GST_Certificate.pdf")
                .fileUrl("https://storage.googleapis.com/aadhiraksha-kyc/sample-gst.pdf")
                .fileSizeBytes(1890000L)
                .fileType("application/pdf")
                .verificationStatus("PENDING_REVIEW")
                .uploadedBy(advisor2)
                .build());

        // 6. Seed Manager Approvals Engine Workflow
        approvalRepository.save(ApprovalRequest.builder()
                .requestType("SPECIAL_DISCOUNT")
                .client(lead1)
                .requestedBy(advisor1)
                .manager(manager)
                .currentValue("₹16,756 (Base Quote)")
                .proposedValue("₹14,500 (15% Corporate Partner Discount)")
                .discountPercent(new BigDecimal("15.00"))
                .status("PENDING")
                .reason("High-net-worth client with 3 active policies in family. Requesting 15% special corporate discount.")
                .build());

        approvalRepository.save(ApprovalRequest.builder()
                .requestType("HIGH_SUM_INSURED")
                .client(lead2)
                .requestedBy(advisor2)
                .manager(manager)
                .currentValue("Standard Cover (1 Cr)")
                .proposedValue("HNW Cover (2 Crore Sum Insured)")
                .discountPercent(null)
                .status("PENDING")
                .reason("Client requested ₹2 Crore Term Coverage. Requires Branch Manager underwriting sign-off.")
                .build());

        // 7. Seed Call Logs & Telephony Dispositions
        callLogRepository.save(CallLog.builder()
                .client(lead1)
                .advisor(advisor1)
                .callResult("CONNECTED_INTERESTED")
                .callDurationSeconds(245)
                .callNotes("Client reviewed Care Supreme vs Star Health quote. Emphasized priority on zero room rent capping.")
                .nextFollowUpDate(LocalDateTime.now().plusHours(4))
                .build());

        callLogRepository.save(CallLog.builder()
                .client(lead3)
                .advisor(advisor1)
                .callResult("CALLBACK_REQUESTED")
                .callDurationSeconds(120)
                .callNotes("Doctor is currently in OPD clinic. Requested follow-up call at 6:30 PM with Zero Dep quote.")
                .nextFollowUpDate(LocalDateTime.now().plusHours(3))
                .build());

        // 8. Seed Follow-up Reminders & Upcoming Meetings
        followUpRepository.save(FollowUpTask.builder()
                .client(lead1)
                .advisor(advisor1)
                .scheduledDatetime(LocalDateTime.now().plusHours(4))
                .reminderMilestone("EXACT")
                .channel("PHONE_CALL")
                .status("PENDING")
                .notes("Follow up on quotation options and final proposal submission.")
                .build());

        meetingRepository.save(ClientMeeting.builder()
                .client(lead3)
                .advisor(advisor1)
                .title("Hyundai Creta Zero-Dep Renewal & NCB Porting Review")
                .purpose("Policy Porting & Add-on Coverage Discussion")
                .product("Vehicle / Motor Insurance")
                .meetingDatetime(LocalDateTime.now().plusHours(2))
                .endDatetime(LocalDateTime.now().plusHours(3))
                .meetingType("GOOGLE_MEET")
                .googleMeetUrl("https://meet.google.com/aadhiraksha-creta-review")
                .status("SCHEDULED")
                .build());

        log.info("Realistic demo dataset seeded successfully with 5 leads, 3 quotations, 4 KYC docs, 2 approvals, 2 call logs, and scheduled meetings.");

        return Map.of(
                "status", "SUCCESS",
                "message", "Realistic demo dataset seeded successfully across all CRM modules.",
                "leadsSeeded", 5,
                "quotationsSeeded", 3,
                "documentsSeeded", 4,
                "approvalsSeeded", 2,
                "seededAt", LocalDateTime.now().toString()
        );
    }
}
