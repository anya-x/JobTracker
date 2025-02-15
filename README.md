# JobTracker - Job Application Tracker

A full-stack web application to help job seekers organise and track their job applications.

> **Project Status**: Backend ✅ | Frontend 🚧

---

## 🎯 Features

- **User Authentication**
- **Application Management**
- **Company Database**
- **Status Pipeline**
- **Smart Validations**
- **Audit Logging**
- **RESTful API**
- **Database**

### 🚧 Coming Soon

- React-based user interface
- Kanban board with drag-and-drop
- Statistics dashboard with charts
- Document upload for resumes
- Advanced filtering and search
- Mobile responsive design

---

## 🛠️ Tech Stack

### Backend

- **Java 21** with **Spring Boot 3.1.5**
- **PostgreSQL**
- **Spring Security**
- **Spring Data JPA**
- **Lombok**
- **SLF4J**
- **Maven**

### Frontend (figuring stack out)

---

## 📚 API Documentation

### Authentication Endpoints (Public - No Token Required)

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |

### Company Endpoints (Protected - Token Required)

| Method | Endpoint                             | Description              |
| ------ | ------------------------------------ | ------------------------ |
| GET    | `/api/companies`                     | Get all companies        |
| GET    | `/api/companies/{id}`                | Get company by ID        |
| POST   | `/api/companies`                     | Create new company       |
| PUT    | `/api/companies/{id}`                | Update company           |
| DELETE | `/api/companies/{id}`                | Delete company           |
| GET    | `/api/companies/search?query={name}` | Search companies by name |

### Application Endpoints (Protected - Token Required)

| Method | Endpoint                                | Description                 |
| ------ | --------------------------------------- | --------------------------- |
| GET    | `/api/applications`                     | Get all applications        |
| GET    | `/api/applications/{id}`                | Get application by ID       |
| POST   | `/api/applications`                     | Create new application      |
| PUT    | `/api/applications/{id}`                | Update application          |
| DELETE | `/api/applications/{id}`                | Delete application          |
| GET    | `/api/applications/status/{status}`     | Get applications by status  |
| GET    | `/api/applications/company/{companyId}` | Get applications by company |

---

## 📊 Application Status Values

```
SAVED          - Saved for later
APPLIED        - Application submitted
SCREENING      - Screening scheduled/completed
INTERVIEW      - Interview scheduled/completed
OFFER          - Offer received
REJECTED       - Application rejected
ACCEPTED       - Offer accepted
WITHDRAWN      - Application withdrawn
```

## 📝 Development Commands

### Backend

```bash
# Start backend
cd backend
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build JAR
./mvnw clean package

# Clean build artifacts
./mvnw clean
```

### Database (Docker)

```bash
# Start PostgreSQL
docker start jobtracker-postgres

# Stop PostgreSQL
docker stop jobtracker-postgres

# View logs
docker logs jobtracker-postgres

# Connect with psql
docker exec -it jobtracker-postgres psql -U postgres -d jobtracker

# Remove container
docker rm -f jobtracker-postgres
```
