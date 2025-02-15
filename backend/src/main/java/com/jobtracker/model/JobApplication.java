package com.jobtracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String position;

    @Column(name = "job_url")
    private String jobUrl;

    private String location;

    @Column(name = "salary_range")
    private String salaryRange;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(length = 2000)
    private String notes;

    @Column(name = "job_description", length = 5000)
    private String jobDescription;

    private Integer priority;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    //TO DO : implement equals and hashcode
}
