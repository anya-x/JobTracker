package com.jobtracker.controller;

import com.jobtracker.dto.JobApplicationDTO;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Company;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<JobApplicationDTO> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getApplicationById(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(app -> ResponseEntity.ok(convertToDTO(app)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public JobApplicationDTO createApplication(@RequestBody JobApplicationDTO dto) {
        JobApplication application = convertToEntity(dto);
        JobApplication saved = applicationRepository.save(application);
        return convertToDTO(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplicationDTO dto) {

        return applicationRepository.findById(id)
                .map(existing -> {
                    existing.setPosition(dto.getPosition());
                    existing.setJobUrl(dto.getJobUrl());
                    existing.setLocation(dto.getLocation());
                    existing.setSalaryRange(dto.getSalaryRange());
                    existing.setStatus(dto.getStatus());
                    existing.setAppliedDate(dto.getAppliedDate());
                    existing.setFollowUpDate(dto.getFollowUpDate());
                    existing.setNotes(dto.getNotes());
                    existing.setJobDescription(dto.getJobDescription());
                    existing.setPriority(dto.getPriority());

                    JobApplication updated = applicationRepository.save(existing);
                    return ResponseEntity.ok(convertToDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        if (applicationRepository.existsById(id)) {
            applicationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/status/{status}")
    public List<JobApplicationDTO> getApplicationsByStatus(@PathVariable ApplicationStatus status) {
        return applicationRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private JobApplicationDTO convertToDTO(JobApplication app) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(app.getId());
        dto.setCompanyId(app.getCompany().getId());
        dto.setCompanyName(app.getCompany().getName());
        dto.setPosition(app.getPosition());
        dto.setJobUrl(app.getJobUrl());
        dto.setLocation(app.getLocation());
        dto.setSalaryRange(app.getSalaryRange());
        dto.setStatus(app.getStatus());
        dto.setAppliedDate(app.getAppliedDate());
        dto.setFollowUpDate(app.getFollowUpDate());
        dto.setNotes(app.getNotes());
        dto.setJobDescription(app.getJobDescription());
        dto.setPriority(app.getPriority());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());
        return dto;
    }

    private JobApplication convertToEntity(JobApplicationDTO dto) {
        JobApplication app = new JobApplication();

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        app.setCompany(company);
        app.setPosition(dto.getPosition());
        app.setJobUrl(dto.getJobUrl());
        app.setLocation(dto.getLocation());
        app.setSalaryRange(dto.getSalaryRange());
        app.setStatus(dto.getStatus());
        app.setAppliedDate(dto.getAppliedDate());
        app.setFollowUpDate(dto.getFollowUpDate());
        app.setNotes(dto.getNotes());
        app.setJobDescription(dto.getJobDescription());
        app.setPriority(dto.getPriority());

        return app;
    }
}
