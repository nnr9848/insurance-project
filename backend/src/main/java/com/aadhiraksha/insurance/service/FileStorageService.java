package com.aadhiraksha.insurance.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path rootStorageLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads/documents}") String uploadDir) {
        this.rootStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootStorageLocation);
            log.info("Initialized secure document storage at: {}", this.rootStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create the upload directory: {}", this.rootStorageLocation, ex);
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Stores a physical file securely on disk and returns the relative storage filename.
     */
    public String storeFile(MultipartFile file, String originalName) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        String rawName = originalName != null && !originalName.isBlank() ? originalName : file.getOriginalFilename();
        if (rawName == null) {
            rawName = "document_" + System.currentTimeMillis();
        }

        // Sanitize filename to prevent path traversal
        String cleanName = rawName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedFileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;

        try {
            Path targetLocation = this.rootStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return storedFileName;
        } catch (IOException ex) {
            log.error("Failed to store file {}", cleanName, ex);
            throw new RuntimeException("Could not store file " + cleanName + ". Please try again!", ex);
        }
    }

    /**
     * Resolves the physical path of a stored file.
     */
    public Path loadFileAsPath(String fileName) {
        return this.rootStorageLocation.resolve(fileName).normalize();
    }

    /**
     * Deletes a physical file securely from disk.
     */
    public boolean deleteFile(String fileName) {
        if (fileName == null || fileName.isBlank()) return false;
        try {
            Path path = loadFileAsPath(fileName);
            return Files.deleteIfExists(path);
        } catch (Exception ex) {
            log.warn("Failed to delete physical file: {}", fileName, ex);
            return false;
        }
    }
}
