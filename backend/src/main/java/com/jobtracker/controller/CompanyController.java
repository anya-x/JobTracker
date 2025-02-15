package com.jobtracker.controller;

import com.jobtracker.dto.CompanyDTO;
import com.jobtracker.model.Company;
import com.jobtracker.model.User;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.extern.slf4j.XSlf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        User currentUser = getCurrentUser();
        log.info("📋 Fetching companies for user: {}", currentUser.getEmail());

        List<Company> companies = companyRepository.findByUserId(currentUser.getId());
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Company>> searchCompanies(@RequestParam String query) {
        User currentUser = getCurrentUser();
        List<Company> companies = companyRepository.findByUserIdAndNameContainingIgnoreCase(
                currentUser.getId(), query);
        log.info("🔍 Search '{}' for user {} returned {} results",
                query, currentUser.getEmail(), companies.size());
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        User currentUser = getCurrentUser();

        return companyRepository.findByIdAndUserId(id, currentUser.getId())
                .map(company -> ResponseEntity.ok((Object) company))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Company not found or access denied"));
    }

    @PostMapping
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        try {
            User currentUser = getCurrentUser();
            company.setUser(currentUser);  // ✅ Set the user

            Company saved = companyRepository.save(company);
            log.info("✅ Created company: {} for user {}", saved.getName(), currentUser.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Failed to create company: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create company: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompany(@PathVariable Long id, @RequestBody Company companyDetails) {
        User currentUser = getCurrentUser();

        return companyRepository.findByIdAndUserId(id, currentUser.getId())
                .map(company -> {
                    company.setName(companyDetails.getName());
                    company.setWebsite(companyDetails.getWebsite());
                    company.setIndustry(companyDetails.getIndustry());
                    company.setLocation(companyDetails.getLocation());
                    company.setNotes(companyDetails.getNotes());
                    Company updated = companyRepository.save(company);
                    log.info("✅ Updated company: {}", updated.getName());
                    return ResponseEntity.ok((Object) updated);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Company not found or access denied"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        User currentUser = getCurrentUser();

        return companyRepository.findByIdAndUserId(id, currentUser.getId())
                .map(company -> {
                    companyRepository.delete(company);
                    log.info("🗑️ Deleted company: {}", company.getName());
                    return ResponseEntity.ok( "Company deleted successfully");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Company not found or access denied"));
    }

    private CompanyDTO convertToDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setWebsite(company.getWebsite());
        dto.setIndustry(company.getIndustry());
        dto.setLocation(company.getLocation());
        dto.setNotes(company.getNotes());
        dto.setCreatedAt(company.getCreatedAt());
        return dto;
    }

    private Company convertToEntity(CompanyDTO dto) {
        Company company = new Company();
        company.setName(dto.getName());
        company.setWebsite(dto.getWebsite());
        company.setIndustry(dto.getIndustry());
        company.setLocation(dto.getLocation());
        company.setNotes(dto.getNotes());
        return company;
    }
}