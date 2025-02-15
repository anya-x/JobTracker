package com.jobtracker.repository;

import com.jobtracker.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByName(String name);

    List<Company> findByNameContainingIgnoreCase(String name);

    List<Company> findByIndustryIgnoreCase(String industry);

    List<Company> findAllByOrderByCreatedAtDesc();

    boolean existsByNameIgnoreCase(String name);

    List<Company> findByCreatedAtAfter(LocalDateTime date);
    List<Company> findByUserId(Long userId);
    List<Company> findByUserIdAndNameContainingIgnoreCase(Long userId, String name);
    Optional<Company> findByIdAndUserId(Long id, Long userId);
}
