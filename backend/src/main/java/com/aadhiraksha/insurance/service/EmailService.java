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

import java.io.File;
import java.nio.charset.StandardCharsets;

/**
 * Enterprise Transactional Email Service.
 * Connects directly to the Stalwart Mail Server container via standard SMTP TLS (Port 587).
 * Dispatches modern responsive HTML templates asynchronously with zero blocking on user requests.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:notifications@aadhirakshainsurance.com}")
    private String fromEmail;

    @Value("${mailserver.domain:aadhirakshainsurance.com}")
    private String mailDomain;

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
            helper.setText(buildBrandedEmailTemplate(subject, htmlContent), true);

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
     * Dispatches Welcome Email with credentials to newly provisioned CRM employees or POSP Agents.
     */
    @Async
    public void sendWelcomeCredentialsEmail(String toEmail, String fullName, String temporaryPassword, String domainMailboxEmail) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>Welcome to the <strong>Aadhiraksha Insurance & Financial Services</strong> ecosystem.</p>
            <p>Your official corporate access credentials have been provisioned:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 8px;"><strong>CRM Portal Username:</strong> <span style="color: #0284c7;">%s</span></p>
                <p style="margin: 0 0 8px;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">%s</code></p>
                %s
            </div>
            <p>Please log in immediately and change your password to complete your onboarding.</p>
            <div style="margin-top: 24px;">
                <a href="https://aadhirakshainsurance.com/login" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Access Portal Now &rarr;
                </a>
            </div>
            """.formatted(
                fullName,
                toEmail,
                temporaryPassword,
                domainMailboxEmail != null 
                    ? "<p style=\"margin: 0;\"><strong>Corporate Email:</strong> <span style=\"color: #059669;\">" + domainMailboxEmail + "</span> (Webmail: <a href=\"https://mail." + mailDomain + "\">mail." + mailDomain + "</a>)</p>" 
                    : ""
        );

        sendHtmlEmail(toEmail, "Welcome to Aadhiraksha - Your Portal Credentials", content);
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
}
