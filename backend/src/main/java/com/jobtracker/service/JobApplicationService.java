package com.jobtracker.service;

import com.jobtracker.dto.ApplicationStatsDTO;
import com.jobtracker.dto.JobApplicationDTO;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Company;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final UserRepository userRepository;

    public List<JobApplicationDTO> getAllApplications() {
        User currentUser = getCurrentUser();
        log.info("📋 Fetching applications for user: {}", currentUser.getEmail());

        return applicationRepository.findByUserId(currentUser.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public JobApplicationDTO getApplicationById(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return convertToDTO(application);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public JobApplicationDTO createApplication(JobApplicationDTO dto) {
        User currentUser = getCurrentUser();

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Security: Check company belongs to user
        if (!company.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        JobApplication application = new JobApplication();
        application.setUser(currentUser);  // ✅ Set the user
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
        application.setInterviewDate(dto.getInterviewDate());
        application.setInterviewTime(dto.getInterviewTime());
        application.setInterviewType(dto.getInterviewType());
        application.setInterviewLocation(dto.getInterviewLocation());

        if (application.getStatus() == ApplicationStatus.APPLIED && application.getAppliedDate() == null) {
            application.setAppliedDate(LocalDate.now());
        }

        JobApplication saved = applicationRepository.save(application);
        log.info("✅ Created application: {} at {} for user {}",
                saved.getPosition(), company.getName(), currentUser.getEmail());

        return convertToDTO(saved);
    }

    @Transactional
    public JobApplicationDTO updateApplication(Long id, JobApplicationDTO dto) {
        User currentUser = getCurrentUser();

        JobApplication application = applicationRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));

        // If changing company, verify new company belongs to user
        if (!application.getCompany().getId().equals(dto.getCompanyId())) {
            Company newCompany = companyRepository.findByIdAndUserId(dto.getCompanyId(), currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Company not found or access denied"));
            application.setCompany(newCompany);
        }

        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus newStatus = dto.getStatus();

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
        application.setInterviewDate(dto.getInterviewDate());
        application.setInterviewTime(dto.getInterviewTime());
        application.setInterviewType(dto.getInterviewType());
        application.setInterviewLocation(dto.getInterviewLocation());


        if (newStatus == ApplicationStatus.APPLIED &&
                oldStatus != ApplicationStatus.APPLIED &&
                application.getAppliedDate() == null) {
            application.setAppliedDate(LocalDate.now());
        }

        JobApplication updated = applicationRepository.save(application);
        log.info("✅ Updated application #{}: {} → {}", id, oldStatus, newStatus);

        return convertToDTO(updated);
    }

    @Transactional
    public void deleteApplication(Long id) {
        User currentUser = getCurrentUser();

        JobApplication application = applicationRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));

        applicationRepository.delete(application);
        log.info("🗑️ Deleted application #{} for user {}", id, currentUser.getEmail());
    }

    public List<JobApplicationDTO> getApplicationsByStatus(ApplicationStatus status) {
        User currentUser = getCurrentUser();
        return applicationRepository.findByUserIdAndStatus(currentUser.getId(), status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<JobApplicationDTO> getApplicationsByCompany(Long companyId) {
        return applicationRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
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
        dto.setInterviewDate(application.getInterviewDate());
        dto.setInterviewTime(application.getInterviewTime());
        dto.setInterviewType(application.getInterviewType());
        dto.setInterviewLocation(application.getInterviewLocation());

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

    public Page<JobApplicationDTO> getAllApplicationsPaginated(Pageable pageable) {
        Page<JobApplication> page = applicationRepository.findAll(pageable);
        return page.map(this::convertToDTO);
    }
}