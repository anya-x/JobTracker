package com.jobtracker.controller;


import com.jobtracker.model.Document;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.DocumentRepository;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

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
            @RequestParam("file") MultipartFile file) {

        try {
            JobApplication application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
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

            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload file");
        }
    }

    @GetMapping("/application/{applicationId}")
    public List<Document> getDocumentsByApplication(@PathVariable Long applicationId) {
        return documentRepository.findByApplicationId(applicationId);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            Path filepath = Paths.get(UPLOAD_DIR, document.getFilePath());
            Resource resource = new UrlResource(filepath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            Document document = documentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            Path filepath = Paths.get(UPLOAD_DIR, document.getFilePath());
            Files.deleteIfExists(filepath);

            documentRepository.deleteById(id);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete document");
        }
    }
}
