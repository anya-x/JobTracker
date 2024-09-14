package com.jobtracker.seeder;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Company;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Configuration
@Profile("demo") // Only runs with --spring.profiles.active=demo
public class DataSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData() {
        return args -> {
            // Check if data already exists
            if (userRepository.count() > 0) {
                System.out.println("Data already seeded. Skipping...");
                return;
            }

            System.out.println("Seeding demo data...");

            // Create demo user
            User demoUser = new User();
            demoUser.setEmail("demo@jobtracker.com");
            demoUser.setPassword(passwordEncoder.encode("demo123"));
            demoUser.setFirstName("Demo");
            demoUser.setLastName("User");
            userRepository.save(demoUser);

            // Create companies
            List<Company> companies = Arrays.asList(
                createCompany("Google", "https://careers.google.com", "Technology", "Mountain View, CA"),
                createCompany("Microsoft", "https://careers.microsoft.com", "Technology", "Redmond, WA"),
                createCompany("Amazon", "https://amazon.jobs", "E-commerce/Cloud", "Seattle, WA"),
                createCompany("Apple", "https://jobs.apple.com", "Technology", "Cupertino, CA"),
                createCompany("Meta", "https://metacareers.com", "Social Media", "Menlo Park, CA"),
                createCompany("Netflix", "https://jobs.netflix.com", "Entertainment", "Los Gatos, CA"),
                createCompany("Tesla", "https://tesla.com/careers", "Automotive/Energy", "Palo Alto, CA"),
                createCompany("Airbnb", "https://careers.airbnb.com", "Hospitality Tech", "San Francisco, CA"),
                createCompany("Stripe", "https://stripe.com/jobs", "Fintech", "San Francisco, CA"),
                createCompany("Uber", "https://uber.com/careers", "Transportation", "San Francisco, CA")
            );
            companyRepository.saveAll(companies);

            // Create job applications
            List<JobApplication> applications = Arrays.asList(
                createApplication(demoUser, companies.get(0), "Senior Software Engineer",
                    ApplicationStatus.INTERVIEW, LocalDate.now().minusDays(20),
                    "$150k - $200k", "Mountain View, CA", 5,
                    "Had a great conversation with the team. Technical interview scheduled for next week."),

                createApplication(demoUser, companies.get(1), "Cloud Solutions Architect",
                    ApplicationStatus.APPLIED, LocalDate.now().minusDays(15),
                    "$140k - $180k", "Redmond, WA (Remote)", 4,
                    "Applied through referral. Waiting to hear back."),

                createApplication(demoUser, companies.get(2), "Full Stack Developer",
                    ApplicationStatus.SCREENING, LocalDate.now().minusDays(10),
                    "$130k - $170k", "Seattle, WA", 4,
                    "Phone screen went well. Discussing next steps with recruiter."),

                createApplication(demoUser, companies.get(3), "iOS Engineer",
                    ApplicationStatus.SAVED, null,
                    "$160k - $210k", "Cupertino, CA", 5,
                    "Dream job! Need to polish iOS portfolio before applying."),

                createApplication(demoUser, companies.get(4), "Frontend Engineer",
                    ApplicationStatus.REJECTED, LocalDate.now().minusDays(30),
                    "$140k - $190k", "Menlo Park, CA", 3,
                    "Didn't make it past technical round. Good learning experience."),

                createApplication(demoUser, companies.get(5), "Backend Engineer",
                    ApplicationStatus.OFFER, LocalDate.now().minusDays(5),
                    "$145k - $185k", "Los Gatos, CA (Hybrid)", 5,
                    "Received offer! Negotiating compensation package."),

                createApplication(demoUser, companies.get(6), "Software Engineer",
                    ApplicationStatus.APPLIED, LocalDate.now().minusDays(12),
                    "$130k - $170k", "Palo Alto, CA", 4,
                    "Excited about working on autonomous driving tech!"),

                createApplication(demoUser, companies.get(7), "Full Stack Engineer",
                    ApplicationStatus.INTERVIEW, LocalDate.now().minusDays(8),
                    "$140k - $180k", "San Francisco, CA (Remote)", 4,
                    "Final round interview scheduled. Preparing system design."),

                createApplication(demoUser, companies.get(8), "Platform Engineer",
                    ApplicationStatus.APPLIED, LocalDate.now().minusDays(18),
                    "$150k - $200k", "San Francisco, CA", 5,
                    "Applied for payments infrastructure team."),

                createApplication(demoUser, companies.get(9), "Senior Backend Engineer",
                    ApplicationStatus.SCREENING, LocalDate.now().minusDays(7),
                    "$135k - $175k", "San Francisco, CA", 3,
                    "Initial screening completed. Waiting for technical round invite.")
            );
            applicationRepository.saveAll(applications);

            System.out.println("Demo data seeded successfully!");
            System.out.println("Login with: demo@jobtracker.com / demo123");
        };
    }

    private Company createCompany(String name, String website, String industry, String location) {
        Company company = new Company();
        company.setName(name);
        company.setWebsite(website);
        company.setIndustry(industry);
        company.setLocation(location);
        return company;
    }

    private JobApplication createApplication(User user, Company company, String position,
                                            ApplicationStatus status, LocalDate appliedDate,
                                            String salaryRange, String location, int priority,
                                            String notes) {
        JobApplication app = new JobApplication();
        app.setUser(user);
        app.setCompany(company);
        app.setPosition(position);
        app.setStatus(status);
        app.setAppliedDate(appliedDate);
        app.setSalaryRange(salaryRange);
        app.setLocation(location);
        app.setPriority(priority);
        app.setNotes(notes);
        return app;
    }
}
