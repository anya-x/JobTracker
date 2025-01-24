package com.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatsDTO {
    private long totalApplications;
    private Map<String, Long> statusCounts;
    private long activeApplications; // Not rejected or withdrawn
    private double responseRate; // Percentage that got responses
}
