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

    /**
     * Render a Thymeleaf template into a compiled HTML string with dynamic variables.
     */
    public String renderTemplate(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        if (variables != null) {
            context.setVariables(variables);
        }
        // Always inject system defaults if not explicitly passed
        if (!context.containsVariable("mailDomain")) {
            context.setVariable("mailDomain", mailDomain);
        }
        if (!context.containsVariable("supportEmail")) {
            context.setVariable("supportEmail", "support@" + mailDomain);
        }
        return templateEngine.process("email/" + templateName, context);
    }

    /**
     * Send email using a Thymeleaf template asynchronously.
     */
    @Async
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
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
