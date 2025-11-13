package com.jobtracker.controller;

import com.jobtracker.dto.ApplicationStatsDTO;
import com.jobtracker.dto.JobApplicationDTO;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class JobApplicationController {

    @Autowired
    private JobApplicationService applicationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "21") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer priority) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<JobApplicationDTO> pagedResult;

        // Check if any filters are applied
        boolean hasFilters = status != null || location != null || search != null ||
                             startDate != null || endDate != null || priority != null;

        if (hasFilters) {
            pagedResult = applicationService.findByFilters(status, location, search, startDate, endDate, priority, pageable);
        } else {
            pagedResult = applicationService.getAllApplicationsPaginated(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("applications", pagedResult.getContent());
        response.put("currentPage", pagedResult.getNumber());
        response.put("totalItems", pagedResult.getTotalElements());
        response.put("totalPages", pagedResult.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getApplicationById(@PathVariable Long id) {
        try {
            JobApplicationDTO dto = applicationService.getApplicationById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody JobApplicationDTO dto) {
        try {
            JobApplicationDTO created = applicationService.createApplication(dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(@PathVariable Long id, @RequestBody JobApplicationDTO dto) {
        try {
            JobApplicationDTO updated = applicationService.updateApplication(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        try {
            applicationService.deleteApplication(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public List<JobApplicationDTO> getApplicationsByStatus(@PathVariable ApplicationStatus status) {
        return applicationService.getApplicationsByStatus(status);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApplicationStatsDTO> getApplicationStats() {
        ApplicationStatsDTO stats = applicationService.getApplicationStats();
        return ResponseEntity.ok(stats);
    }
}