package com.jobtracker.service;

import com.jobtracker.dto.ApplicationStatsDTO;
import com.jobtracker.dto.JobApplicationDTO;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Company;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;

    public List<JobApplicationDTO> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public JobApplicationDTO getApplicationById(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return convertToDTO(application);
    }

    @Transactional
    public JobApplicationDTO createApplication(JobApplicationDTO dto) {
        // Validate company exists
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        List<JobApplication> existingApps = applicationRepository.findByCompanyId(dto.getCompanyId());
        boolean hasSamePosition = existingApps.stream()
                .anyMatch(app -> app.getPosition().equalsIgnoreCase(dto.getPosition()));

        if (hasSamePosition) {
            log.warn("⚠️ Creating duplicate application: {} at {}", dto.getPosition(), company.getName());
        }

        // Create application
        JobApplication application = new JobApplication();
        application.setCompany(company);
        application.setPosition(dto.getPosition());
        application.setJobUrl(dto.getJobUrl());
        application.setLocation(dto.getLocation());
        application.setSalaryRange(dto.getSalaryRange());
        application.setStatus(dto.getStatus());
        application.setAppliedDate(dto.getAppliedDate());
        application.setFollowUpDate(dto.getFollowUpDate());
        application.setNotes(dto.getNotes());
        application.setJobDescription(dto.getJobDescription());
        application.setPriority(dto.getPriority());

        // Auto-set applied date if status is APPLIED and date not provided
        if (application.getStatus() == ApplicationStatus.APPLIED && application.getAppliedDate() == null) {
            application.setAppliedDate(LocalDate.now());
            log.info("✅ Auto-set applied date to today for {}", dto.getPosition());
        }

        JobApplication saved = applicationRepository.save(application);
        log.info("✅ Created application: {} at {}", saved.getPosition(), company.getName());

        return convertToDTO(saved);
    }

    @Transactional
    public JobApplicationDTO updateApplication(Long id, JobApplicationDTO dto) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus newStatus = dto.getStatus();

        // Soft validation: Log unusual transitions (but allow them)
        if (isUnusualTransition(oldStatus, newStatus)) {
            log.warn("⚠️ Unusual status transition: {} → {} for application #{}",
                    oldStatus, newStatus, id);
            log.warn("   Position: {} at {}", application.getPosition(), application.getCompany().getName());
            // Still allow it - user might have good reason!
        }

        // Update company if changed
        if (!application.getCompany().getId().equals(dto.getCompanyId())) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            application.setCompany(company);
        }

        // Update fields
        application.setPosition(dto.getPosition());
        application.setJobUrl(dto.getJobUrl());
        application.setLocation(dto.getLocation());
        application.setSalaryRange(dto.getSalaryRange());
        application.setStatus(newStatus);
        application.setAppliedDate(dto.getAppliedDate());
        application.setFollowUpDate(dto.getFollowUpDate());
        application.setNotes(dto.getNotes());
        application.setJobDescription(dto.getJobDescription());
        application.setPriority(dto.getPriority());

        // Auto-set applied date when transitioning to APPLIED
        if (newStatus == ApplicationStatus.APPLIED &&
                oldStatus != ApplicationStatus.APPLIED &&
                application.getAppliedDate() == null) {
            application.setAppliedDate(LocalDate.now());
            log.info("✅ Auto-set applied date when status changed to APPLIED");
        }

        JobApplication updated = applicationRepository.save(application);
        log.info("✅ Updated application #{}: {} → {}", id, oldStatus, newStatus);

        return convertToDTO(updated);
    }

    @Transactional
    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new RuntimeException("Application not found");
        }
        applicationRepository.deleteById(id);
        log.info("🗑️ Deleted application #{}", id);
    }

    public List<JobApplicationDTO> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<JobApplicationDTO> getApplicationsByCompany(Long companyId) {
        return applicationRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if a status transition is unusual (but still allowed)
     */
    private boolean isUnusualTransition(ApplicationStatus from, ApplicationStatus to) {
        if (from == to) {
            return false;
        }

        // Transitions that are unusual but might happen:
        return (from == ApplicationStatus.ACCEPTED && to != ApplicationStatus.ACCEPTED) ||  // Un-accepting
                (from == ApplicationStatus.REJECTED && to == ApplicationStatus.OFFER) ||      // Rejected to Offer
                (from == ApplicationStatus.WITHDRAWN && to == ApplicationStatus.INTERVIEW) || // Withdrawn to Interview
                (from == ApplicationStatus.OFFER && to == ApplicationStatus.SAVED);           // Offer back to Saved

        // All other transitions are considered normal
    }

    private JobApplicationDTO convertToDTO(JobApplication application) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(application.getId());
        dto.setCompanyId(application.getCompany().getId());
        dto.setCompanyName(application.getCompany().getName());
        dto.setPosition(application.getPosition());
        dto.setJobUrl(application.getJobUrl());
        dto.setLocation(application.getLocation());
        dto.setSalaryRange(application.getSalaryRange());
        dto.setStatus(application.getStatus());
        dto.setAppliedDate(application.getAppliedDate());
        dto.setFollowUpDate(application.getFollowUpDate());
        dto.setNotes(application.getNotes());
        dto.setJobDescription(application.getJobDescription());
        dto.setPriority(application.getPriority());
        dto.setCreatedAt(application.getCreatedAt());
        dto.setUpdatedAt(application.getUpdatedAt());
        return dto;
    }

    public ApplicationStatsDTO getApplicationStats() {
        List<JobApplication> allApps = applicationRepository.findAll();

        long total = allApps.size();

        // Count by status
        Map<String, Long> statusCounts = allApps.stream()
                .collect(Collectors.groupingBy(
                        app -> app.getStatus().toString(),
                        Collectors.counting()
                ));

        // Count active (not rejected or withdrawn)
        long active = allApps.stream()
                .filter(app -> app.getStatus() != ApplicationStatus.REJECTED &&
                        app.getStatus() != ApplicationStatus.WITHDRAWN)
                .count();

        // Calculate response rate (got interview, offer, or rejection)
        long responded = allApps.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SCREENING||
                        app.getStatus() == ApplicationStatus.INTERVIEW ||
                        app.getStatus() == ApplicationStatus.OFFER ||
                        app.getStatus() == ApplicationStatus.REJECTED)
                .count();

        double responseRate = total > 0 ? (responded * 100.0 / total) : 0.0;

        return new ApplicationStatsDTO(total, statusCounts, active, responseRate);
    }
}