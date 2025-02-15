package com.jobtracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor()
@ToString(onlyExplicitlyIncluded = true)
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String website;

    private String industry;

    private String location;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    //TO DO : implement equals and hashcode
}
