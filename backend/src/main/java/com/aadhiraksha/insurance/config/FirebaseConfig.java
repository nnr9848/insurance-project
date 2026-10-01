package com.aadhiraksha.insurance.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.enabled:false}")
    private boolean enabled;

    @Value("${firebase.project-id:aadhiraksha-insurance}")
    private String projectId;

    @Value("${firebase.credentials-path:}")
    private String credentialsPath;

    @PostConstruct
    public void initializeFirebase() {
        if (!enabled) {
            log.info("[Firebase Config] Firebase Admin SDK is disabled in application.yml (enabled: false). Phone OTP verification will mock or bypass.");
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions.Builder builder = FirebaseOptions.builder();

                if (credentialsPath != null && !credentialsPath.isBlank()) {
                    try (InputStream serviceAccount = new FileInputStream(credentialsPath)) {
                        builder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                    }
                } else {
                    // Try Application Default Credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS) or project ID
                    builder.setCredentials(GoogleCredentials.getApplicationDefault());
                }

                builder.setProjectId(projectId);
                FirebaseApp.initializeApp(builder.build());
                log.info("[Firebase Config] Firebase Admin SDK initialized successfully for project: {}", projectId);
            }
        } catch (Exception e) {
            log.warn("[Firebase Config] Could not initialize Firebase Admin SDK (credentials not provided or invalid): {}. Phone Auth backend will require credentials to verify real tokens.", e.getMessage());
        }
    }
}
