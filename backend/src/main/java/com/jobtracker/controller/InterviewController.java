package com.jobtracker.controller;

import com.jobtracker.dto.InterviewDTO;
import com.jobtracker.model.Interview;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @GetMapping
    public List<InterviewDTO> getAllInterviews() {
        return interviewRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/upcoming")
    public List<InterviewDTO> getUpcomingInterviews() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextMonth = now.plusMonths(1);
        return interviewRepository.findByInterviewDateBetween(now, nextMonth).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/application/{applicationId}")
    public List<InterviewDTO> getInterviewsByApplication(@PathVariable Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<InterviewDTO> createInterview(@RequestBody InterviewDTO dto) {
        JobApplication application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setInterviewDate(dto.getInterviewDate());
        interview.setInterviewType(dto.getInterviewType());
        interview.setLocation(dto.getLocation());
        interview.setInterviewerName(dto.getInterviewerName());
        interview.setNotes(dto.getNotes());

        Interview saved = interviewRepository.save(interview);
        return ResponseEntity.ok(convertToDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterviewDTO> updateInterview(@PathVariable Long id, @RequestBody InterviewDTO dto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setInterviewDate(dto.getInterviewDate());
        interview.setInterviewType(dto.getInterviewType());
        interview.setLocation(dto.getLocation());
        interview.setInterviewerName(dto.getInterviewerName());
        interview.setNotes(dto.getNotes());

        Interview updated = interviewRepository.save(interview);
        return ResponseEntity.ok(convertToDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInterview(@PathVariable Long id) {
        interviewRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private InterviewDTO convertToDTO(Interview interview) {
        InterviewDTO dto = new InterviewDTO();
        dto.setId(interview.getId());
        dto.setApplicationId(interview.getApplication().getId());
        dto.setCompanyName(interview.getApplication().getCompany().getName());
        dto.setPosition(interview.getApplication().getPosition());
        dto.setInterviewDate(interview.getInterviewDate());
        dto.setInterviewType(interview.getInterviewType());
        dto.setLocation(interview.getLocation());
        dto.setInterviewerName(interview.getInterviewerName());
        dto.setNotes(interview.getNotes());
        dto.setCreatedAt(interview.getCreatedAt());
        return dto;
    }
}
