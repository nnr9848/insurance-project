package com.aadhiraksha.insurance.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Enterprise Transactional Email Service.
 * Connects directly to the Stalwart Mail Server container via standard SMTP TLS (Port 587/465).
 * Dispatches modern responsive Thymeleaf HTML templates asynchronously with zero blocking on user requests.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:notifications@aadhirakshainsurance.com}")
    private String fromEmail;

    @Value("${mailserver.domain:aadhirakshainsurance.com}")
    private String mailDomain;

    @Value("${spring.mail.host:mailserver}")
    private String mailHost;

    @Value("${spring.mail.port:465}")
    private int mailPort;

    /**
     * Send standard transactional HTML email asynchronously.
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        sendHtmlEmailWithAttachment(to, subject, htmlContent, null, null);
    }

    /**
     * Send transactional HTML email with optional file attachment (e.g. Policy PDF, Quote, Receipt).
     */
    @Async
    public void sendHtmlEmailWithAttachment(String to, String subject, String htmlContent, String attachmentFilename, File attachmentFile) {
        if (to == null || to.trim().isEmpty() || !to.contains("@")) {
            log.warn("Skipping email dispatch: recipient address is invalid: {}", to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(fromEmail, "Aadhiraksha Insurance");
            helper.setTo(to.trim());
            helper.setSubject(subject);

            String finalBody = isCompleteHtmlDocument(htmlContent) 
                    ? htmlContent 
                    : buildBrandedEmailTemplate(subject, htmlContent);
            helper.setText(finalBody, true);

            if (attachmentFilename != null && attachmentFile != null && attachmentFile.exists()) {
                helper.addAttachment(attachmentFilename, attachmentFile);
            }

            mailSender.send(message);
            log.info("Transactional email successfully dispatched to {} | Subject: '{}'", to, subject);

        } catch (MessagingException me) {
            log.error("MessagingException dispatching email to {}: {}", to, me.getMessage());
        } catch (Exception ex) {
            log.error("Failed to send transactional email to {}: {}", to, ex.getMessage());
        }
    }

    /**
     * Synchronously dispatch an email and throw exceptions on failure.
     * Used by the Admin Test Delivery Diagnostic Endpoint to provide real-time UI feedback.
     */
    public void sendEmailDirect(String to, String subject, String htmlContent) throws Exception {
        if (to == null || to.trim().isEmpty() || !to.contains("@")) {
            throw new IllegalArgumentException("Invalid recipient email address format: " + to);
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                message,
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                StandardCharsets.UTF_8.name()
        );

        helper.setFrom(fromEmail, "Aadhiraksha Insurance");
        helper.setTo(to.trim());
        helper.setSubject(subject);

        String finalBody = isCompleteHtmlDocument(htmlContent) 
                ? htmlContent 
                : buildBrandedEmailTemplate(subject, htmlContent);
        helper.setText(finalBody, true);

        mailSender.send(message);
        log.info("Direct test email successfully dispatched via SMTP to {}", to);
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.aadhiraksha.insurance.repository.BusinessProfileRepository businessProfileRepository;

    /**
     * Default body contents for the registered templates (before shell wrapping).
     */
    public static final Map<String, String> DEFAULT_TEMPLATE_BODIES = Map.of(
        "smtp-diagnostic", """
            <p style="margin-top: 0;">Hello,</p>
            <p>This is an automated <strong>SMTP Delivery Verification Test</strong> dispatched directly from the <strong>Aadhiraksha CRM Operations Console</strong>.</p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <p style="margin: 0 0 8px; color: #166534; font-weight: 800; font-size: 15px;">✔ Stalwart SMTP Handshake Successful</p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #15803d; line-height: 1.6;">
                <tr><td width="35%"><strong>Recipient Address:</strong></td><td>{{recipientEmail}}</td></tr>
                <tr><td><strong>Dispatch Timestamp:</strong></td><td>{{dispatchTimestamp}}</td></tr>
                <tr><td><strong>Mail Node Host:</strong></td><td><code style="background: #dcfce7; padding: 2px 6px; border-radius: 4px;">{{mailHost}}</code></td></tr>
                <tr><td><strong>Triggered By:</strong></td><td>{{triggeredBy}}</td></tr>
              </table>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">All outbound encryption (TLS/SSL) and transport channels are operating nominally.</p>
            """,

        "welcome-credentials", """
            <p style="margin-top: 0;">Dear <strong>{{fullName}}</strong>,</p>
            <p>Welcome to the <strong>Aadhiraksha Insurance & Financial Services</strong> ecosystem. Your official corporate access credentials have been provisioned.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 24px 0;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7; font-weight: 800;">🔑 Portal Access Credentials</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.8;">
                <tr><td width="35%" style="color: #64748b; font-weight: 600;">CRM Portal Login:</td><td><strong style="color: #0284c7;">{{crmUsername}}</strong></td></tr>
                <tr><td style="color: #64748b; font-weight: 600;">Temporary Password:</td><td><code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #0f172a;">{{temporaryPassword}}</code></td></tr>
                <tr><td style="color: #64748b; font-weight: 600; padding-top: 8px;">Corporate Email:</td><td style="padding-top: 8px;"><strong style="color: #059669;">{{domainMailboxEmail}}</strong><span style="font-size: 12px; color: #64748b; display: block;">Webmail: <a href="{{webmailUrl}}" style="color: #0284c7;" target="_blank">{{webmailUrl}}</a></span></td></tr>
              </table>
            </div>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #92400e; border-radius: 0 8px 8px 0;">
              <strong>Security Mandatory:</strong> You will be prompted to change this temporary password upon your initial login. Do not share your credentials with anyone.
            </div>
            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="{{portalLoginUrl}}" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);">Log in to CRM Portal &rarr;</a>
            </div>
            """,

        "customer-enquiry-receipt", """
            <p style="margin-top: 0;">Dear <strong>{{customerName}}</strong>,</p>
            <p>Thank you for submitting your insurance requirement to <strong>Aadhiraksha Insurance & Financial Services</strong>. We have successfully logged your enquiry into our advisory queue.</p>
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; margin: 24px 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.8;">
                <tr><td width="40%" style="color: #0369a1; font-weight: 600;">Enquiry Reference #:</td><td><strong style="color: #0c4a6e;">{{enquiryReference}}</strong></td></tr>
                <tr><td style="color: #0369a1; font-weight: 600;">Requested Category:</td><td><strong style="color: #0284c7;">{{insuranceCategory}}</strong></td></tr>
                <tr><td style="color: #0369a1; font-weight: 600;">Assigned Advisory Desk:</td><td><span>Dedicated Operations Advisory Team</span></td></tr>
              </table>
            </div>
            <p>One of our certified insurance advisors is currently reviewing carrier rates to structure the most comprehensive risk coverage for you at optimal premium pricing.</p>
            <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; margin: 24px 0; border-radius: 0 8px 8px 0; font-size: 13px; color: #475569;">
              <strong>What to expect next:</strong> Our advisor will connect with you within <strong>2 business hours</strong> via your verified phone number or email with comparison proposals.
            </div>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">If your requirement is urgent, you can directly reach our helpline or reply directly to this email.</p>
            """,

        "policy-quote", """
            <p style="margin-top: 0;">Dear <strong>{{customerName}}</strong>,</p>
            <p>Thank you for consulting with Aadhiraksha. Based on your risk profile, here is your customized insurance quotation prepared by our certified underwriting advisory:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 24px 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.9;">
                <tr><td width="40%" style="color: #64748b;">Quotation Ref #:</td><td><strong style="color: #0f172a;">{{quoteReference}}</strong></td></tr>
                <tr><td style="color: #64748b;">Coverage Plan:</td><td><strong style="color: #0284c7;">{{planName}}</strong></td></tr>
                <tr><td style="color: #64748b;">Insurance Carrier:</td><td><span>{{insurerName}}</span></td></tr>
                <tr><td style="color: #64748b;">Sum Insured:</td><td><strong style="color: #059669; font-size: 15px;">{{sumInsured}}</strong></td></tr>
                <tr><td style="color: #64748b;">Calculated Premium:</td><td><strong style="color: #0f172a; font-size: 16px;">{{premiumAmount}}</strong></td></tr>
              </table>
            </div>
            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="{{proposalUrl}}" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);">View Detailed Proposal & KYC &rarr;</a>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">This quote is valid for 15 days from dispatch. Final issuance is subject to carrier underwriting approval and medical documentation if applicable.</p>
            """
    );

    /**
     * Interpolates {{variable}} or ${variable} tokens inside a string with tolerant fallbacks.
     */
    public String interpolateTokens(String content, Map<String, Object> variables) {
        if (content == null) return "";
        String result = content;
        if (variables != null) {
            for (Map.Entry<String, Object> entry : variables.entrySet()) {
                String val = entry.getValue() != null ? String.valueOf(entry.getValue()) : "";
                result = result.replace("{{" + entry.getKey() + "}}", val);
                result = result.replace("${" + entry.getKey() + "}", val);
            }
        }
        return result;
    }

    /**
     * Render an email template into a fully formed HTML document with master branding shell.
     * Looks up custom body content from BusinessProfile settings if present; falls back to default.
     */
    public String renderTemplate(String templateName, Map<String, Object> variables) {
        String bodyContent = null;
        if (businessProfileRepository != null) {
            try {
                com.aadhiraksha.insurance.model.BusinessProfile profile = businessProfileRepository.findById(1L).orElse(null);
                if (profile != null && profile.getEmailTemplatesConfigJson() != null && !profile.getEmailTemplatesConfigJson().isBlank()) {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    Map<String, Object> config = mapper.readValue(profile.getEmailTemplatesConfigJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                    if (config != null && config.containsKey(templateName)) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> item = (Map<String, Object>) config.get(templateName);
                        if (item != null && item.get("body") != null && !((String) item.get("body")).isBlank()) {
                            bodyContent = (String) item.get("body");
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Could not retrieve custom body for template '{}': {}", templateName, ex.getMessage());
            }
        }

        if (bodyContent == null || bodyContent.isBlank()) {
            bodyContent = DEFAULT_TEMPLATE_BODIES.getOrDefault(templateName, "<p>Notification from Aadhiraksha Insurance.</p>");
        }

        String interpolatedBody = interpolateTokens(bodyContent, variables);
        return buildBrandedEmailTemplate("Aadhiraksha Insurance", interpolatedBody);
    }

    /**
     * Send email using a template asynchronously.
     */
    @Async
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            // Check if template is enabled in configuration
            if (businessProfileRepository != null) {
                com.aadhiraksha.insurance.model.BusinessProfile profile = businessProfileRepository.findById(1L).orElse(null);
                if (profile != null && profile.getEmailTemplatesConfigJson() != null && !profile.getEmailTemplatesConfigJson().isBlank()) {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    Map<String, Object> config = mapper.readValue(profile.getEmailTemplatesConfigJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                    if (config != null && config.containsKey(templateName)) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> item = (Map<String, Object>) config.get(templateName);
                        if (item != null && Boolean.FALSE.equals(item.get("enabled"))) {
                            log.info("Email template '{}' is disabled by admin settings. Skipping dispatch to {}", templateName, to);
                            return;
                        }
                        if (item != null && item.get("subject") != null && !((String) item.get("subject")).isBlank()) {
                            subject = interpolateTokens((String) item.get("subject"), variables);
                        }
                    }
                }
            }

            String htmlContent = renderTemplate(templateName, variables);
            sendHtmlEmail(to, subject, htmlContent);
        } catch (Exception ex) {
            log.error("Failed to render and send template email '{}' to {}: {}", templateName, to, ex.getMessage(), ex);
        }
    }

    /**
     * Dispatches Welcome Email with credentials to newly provisioned CRM employees or POSP Agents using Thymeleaf.
     */
    @Async
    public void sendWelcomeCredentialsEmail(String toEmail, String fullName, String temporaryPassword, String domainMailboxEmail) {
        try {
            Map<String, Object> model = Map.of(
                    "fullName", fullName != null ? fullName : "Team Member",
                    "crmUsername", toEmail,
                    "temporaryPassword", temporaryPassword != null ? temporaryPassword : "N/A",
                    "domainMailboxEmail", domainMailboxEmail != null ? domainMailboxEmail : "",
                    "portalLoginUrl", "https://aadhirakshainsurance.com/login",
                    "webmailUrl", "https://mail." + mailDomain
            );

            String htmlContent = renderTemplate("welcome-credentials", model);
            sendHtmlEmail(toEmail, "Welcome to Aadhiraksha - Your Portal Credentials", htmlContent);
            log.info("Welcome credentials email dispatched successfully to {} for user {}", toEmail, fullName);
        } catch (Exception ex) {
            log.error("Failed to dispatch welcome credentials email to {}: {}", toEmail, ex.getMessage(), ex);
        }
    }

    /**
     * Send Customer Enquiry Receipt Acknowledgment via Thymeleaf.
     */
    @Async
    public void sendCustomerEnquiryReceipt(String customerEmail, String customerName, String enquiryRef, String category) {
        try {
            Map<String, Object> model = Map.of(
                    "customerName", customerName != null ? customerName : "Customer",
                    "enquiryReference", enquiryRef != null ? enquiryRef : "ADR-ENQ-" + System.currentTimeMillis() % 100000,
                    "insuranceCategory", category != null ? category : "General Insurance Advisory"
            );
            String htmlContent = renderTemplate("customer-enquiry-receipt", model);
            sendHtmlEmail(customerEmail, "We Received Your Enquiry [" + model.get("enquiryReference") + "] - Aadhiraksha Insurance", htmlContent);
        } catch (Exception ex) {
            log.error("Failed to dispatch enquiry receipt email to {}: {}", customerEmail, ex.getMessage(), ex);
        }
    }

    /**
     * Send Policy Quotation breakdown via Thymeleaf.
     */
    @Async
    public void sendPolicyQuoteEmail(String customerEmail, String customerName, String quoteRef, String planName, String insurer, String sumInsured, String premium, String proposalUrl) {
        try {
            Map<String, Object> model = Map.of(
                    "customerName", customerName != null ? customerName : "Valued Customer",
                    "quoteReference", quoteRef != null ? quoteRef : "ADR-QT-" + System.currentTimeMillis() % 100000,
                    "planName", planName != null ? planName : "Comprehensive Insurance Cover",
                    "insurerName", insurer != null ? insurer : "Aadhiraksha Partner Insurers",
                    "sumInsured", sumInsured != null ? sumInsured : "As per plan",
                    "premiumAmount", premium != null ? premium : "Contact Advisor",
                    "proposalUrl", proposalUrl != null ? proposalUrl : "https://aadhirakshainsurance.com"
            );
            String htmlContent = renderTemplate("policy-quote", model);
            sendHtmlEmail(customerEmail, "Insurance Proposal & Quotation [" + model.get("quoteReference") + "] - Aadhiraksha", htmlContent);
        } catch (Exception ex) {
            log.error("Failed to dispatch quote email to {}: {}", customerEmail, ex.getMessage(), ex);
        }
    }

    /**
     * Synchronously dispatch SMTP Diagnostic Health check email via Thymeleaf.
     */
    public void sendDiagnosticTestEmail(String toEmail, String triggeredBy) throws Exception {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss");
        Map<String, Object> model = Map.of(
                "recipientEmail", toEmail,
                "dispatchTimestamp", LocalDateTime.now().format(dtf) + " IST",
                "mailHost", mailHost + ":" + mailPort,
                "triggeredBy", triggeredBy != null ? triggeredBy : "System Administrator"
        );
        String subject = "Aadhiraksha Mail Diagnostic: Outbound SMTP Delivery Verified";
        String htmlContent = renderTemplate("smtp-diagnostic", model);
        sendEmailDirect(toEmail, subject, htmlContent);
    }

    /**
     * Wraps raw HTML content inside an IRDAI-compliant, mobile-responsive Aadhiraksha email envelope.
     */
    private String buildBrandedEmailTemplate(String title, String bodyContent) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>%s</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #1e293b;">
              <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                      
                      <!-- Brand Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #0284c7 0%%, #0369a1 100%%); padding: 24px 32px; text-align: left;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                            🛡️ Aadhiraksha Insurance
                          </h1>
                          <p style="color: #bae6fd; margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Financial Services & Risk Solutions
                          </p>
                        </td>
                      </tr>

                      <!-- Email Body -->
                      <tr>
                        <td style="padding: 32px; font-size: 15px; line-height: 1.65; color: #334155;">
                          %s
                        </td>
                      </tr>

                      <!-- Regulatory & Statutory Footer -->
                      <tr>
                        <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
                          <p style="margin: 0 0 6px;">
                            <strong>Aadhiraksha Insurance & Financial Services Pvt Ltd</strong><br>
                            IRDAI Licensed Insurance Intermediary | ISO/IEC 27001 Certified Security Standards
                          </p>
                          <p style="margin: 0;">
                            This is an automated system notification. If you did not request this, please contact support at <a href="mailto:support@%s" style="color: #0284c7;">support@%s</a>.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(title, bodyContent, mailDomain, mailDomain);
    }

    /**
     * Helper to detect whether a content payload is already a fully formed HTML document
     * (e.g. from a Thymeleaf template) to avoid accidental double-wrapping.
     */
    private boolean isCompleteHtmlDocument(String content) {
        if (content == null) {
            return false;
        }
        String trimmed = content.trim().toLowerCase();
        return trimmed.startsWith("<!doctype html") 
                || trimmed.startsWith("<html") 
                || trimmed.contains("<body");
    }
}
