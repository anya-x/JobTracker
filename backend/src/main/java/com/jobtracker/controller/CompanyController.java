package com.jobtracker.controller;

import com.jobtracker.dto.CompanyDTO;
import com.jobtracker.model.Company;
import com.jobtracker.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {
    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        return companyRepository.findById(id)
                .map(company -> ResponseEntity.ok(convertToDTO(company)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CompanyDTO createCompany(@RequestBody CompanyDTO dto) {
        Company company = convertToEntity(dto);
        Company saved = companyRepository.save(company);
        return convertToDTO(saved);
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
