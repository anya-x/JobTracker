package com.jobtracker.repository;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>, JpaSpecificationExecutor<JobApplication> {

    List<JobApplication> findByStatus(ApplicationStatus status);

    List<JobApplication> findByCompanyId(Long companyId);

    List<JobApplication> findByPositionContainingIgnoreCase(String position);

    List<JobApplication> findByPosition(String position);

    Optional<JobApplication> findByCompany_Website(String website);

    JobApplication findByCompany_Industry(String industry);

    JobApplication findByCompany_Location(String location);

    List<JobApplication> findByUserId(Long userId);
    List<JobApplication> findByUserIdAndStatus(Long userId, ApplicationStatus status);
    List<JobApplication> findByUserIdAndCompanyId(Long userId, Long companyId);
    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    // Count methods for stats
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

}
