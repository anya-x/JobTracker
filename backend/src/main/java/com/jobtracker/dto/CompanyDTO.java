package com.jobtracker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CompanyDTO {
    private Long id;
    private String name;
    private String website;
    private String industry;
    private String location;
    private String notes;
    private LocalDateTime createdAt;
}
