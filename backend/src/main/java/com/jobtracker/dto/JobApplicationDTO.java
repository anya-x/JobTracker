package com.jobtracker.dto;

import com.jobtracker.model.ApplicationStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class JobApplicationDTO {
    private Long id;
    private Long companyId;
    private String companyName;
    private String position;
    private String jobUrl;
    private String location;
    private String salaryRange;
    private ApplicationStatus status;
    private LocalDate appliedDate;
    private LocalDate followUpDate;
    private String notes;
    private String jobDescription;
    private Integer priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDate interviewDate;
    private String interviewTime;
    private String interviewType;
    private String interviewLocation;
}