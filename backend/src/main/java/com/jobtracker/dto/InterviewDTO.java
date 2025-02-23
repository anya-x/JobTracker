package com.jobtracker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewDTO {
    private Long id;
    private Long applicationId;
    private String companyName;
    private String position;
    private LocalDateTime interviewDate;
    private String interviewType;
    private String location;
    private String interviewerName;
    private String notes;
    private LocalDateTime createdAt;
}