package com.jobtracker.controller;

import com.jobtracker.model.Document;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.DocumentRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    private final String UPLOAD_DIR = System.getProperty("user.home") + "/jobtracker-uploads/";

    public DocumentController() {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    @PostMapping("/upload/{applicationId}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long applicationId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {  // ← ADDED THIS PARAMETER

        System.out.println("=== UPLOAD REQUEST ===");
        System.out.println("Application ID: " + applicationId);
        System.out.println("User: " + (authentication != null ? authentication.getName() : "NULL"));
        System.out.println("File: " + (file != null ? file.getOriginalFilename() : "NULL"));

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User found: " + user.getEmail());

            JobApplication application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            System.out.println("Application found, owner: " + application.getUser().getEmail());

            if (!application.getUser().getId().equals(user.getId())) {
                System.err.println("ERROR: Application belongs to different user!");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized access to application");
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String contentType = file.getContentType();
            if (!isValidFileType(contentType)) {
                return ResponseEntity.badRequest()
                        .body("Invalid file type. Only PDF, DOC, DOCX allowed.");
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body("File size exceeds 10MB limit");
            }

            String originalFilename = file.getOriginalFilename();
            String filename = System.currentTimeMillis() + "_" + originalFilename;
            Path filepath = Paths.get(UPLOAD_DIR, filename);

            Files.write(filepath, file.getBytes());

            Document document = new Document();
            document.setApplication(application);
            document.setFileName(originalFilename);
            document.setFileType(file.getContentType());
            document.setFilePath(filename);
            document.setFileSize(file.getSize());

            Document saved = documentRepository.save(document);

            System.out.println("File uploaded successfully: " + filename);

            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            System.err.println("IO Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<?> getDocumentsByApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobApplication application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (!application.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized access to application");
            }

            List<Document> documents = documentRepository.findByApplicationId(applicationId);
            return ResponseEntity.ok(documents);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body( e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadDocument(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Not authenticated");
        }
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            if (!document.getApplication().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body( "Unauthorized access to document");
            }

            Path filepath = Paths.get(UPLOAD_DIR, document.getFilePath());

            if (!Files.exists(filepath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body( "File not found on disk");
            }

            Resource resource = new UrlResource(filepath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("File not readable");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body( e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            if (!document.getApplication().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized access to document");
            }

            Path filepath = Paths.get(UPLOAD_DIR, document.getFilePath());
            Files.deleteIfExists(filepath);

            documentRepository.deleteById(id);

            return ResponseEntity.ok("Document deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete document: " + e.getMessage());
        }
    }

    private boolean isValidFileType(String contentType) {
        return contentType != null && (
                contentType.equals("application/pdf") ||
                        contentType.equals("application/msword") ||
                        contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        );
    }
}