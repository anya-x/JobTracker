# JobTracker - Job Application Tracker

A full-stack web application to help job seekers organize and track their job applications throughout the hiring process.

> **Project Status**: ✅ Fully Functional | 🚀 Production Ready

---

## 🎯 Features

### Application Management
- **Track Applications**: Manage job applications with detailed information (position, company, salary, location)
- **Status Pipeline**: Visualize applications through different stages (Saved → Applied → Screening → Interview → Offer)
- **Smart Validations**: Prevents duplicate applications and enforces logical status transitions
- **Notes & Details**: Add custom notes, job descriptions, and follow-up dates

### Visualization & Analytics
- **Kanban Board**: Drag-and-drop interface for visual status updates (4-column responsive layout)
- **Statistics Dashboard**: Interactive charts showing application metrics and success rates
- **Interview Calendar**: Upcoming interviews view with date/time management
- **Advanced Filtering**: Search by status, date range, location, priority, and salary

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Toast notifications for all actions
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Helpful guidance when no data exists
- **Pagination**: Efficient handling of large datasets (21 items per page)

### Technical Features
- **JWT Authentication**: Secure user registration and login
- **User Isolation**: Each user only sees their own applications
- **Document Upload**: Store resumes and cover letters (up to 10MB)
- **Company Database**: Searchable company directory with autocomplete
- **RESTful API**: Clean, well-documented backend API

---

## 🛠️ Tech Stack

### Backend
- **Java 21** with **Spring Boot 3.1.5**
- **PostgreSQL** database
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Specifications for dynamic queries
- **Lombok** for boilerplate reduction
- **Maven** for dependency management

### Frontend
- **React 19** with **Vite**
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **@hello-pangea/dnd** for drag-and-drop
- **React Hot Toast** for notifications
- **Axios** for API calls

---

## 📋 Prerequisites

- **Java 21** or higher
- **Node.js 16+** and npm
- **PostgreSQL 14+**
- **Git**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/JobTracker.git
cd JobTracker
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb jobtracker

# Or using Docker
docker run --name jobtracker-postgres \
  -e POSTGRES_DB=jobtracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Update database credentials in src/main/resources/application.properties if needed
# spring.datasource.username=your_username
# spring.datasource.password=your_password

# Run the application
./mvnw spring-boot:run

# Backend will run on http://localhost:8080
```

### 4. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080/api" > .env

# Start development server
npm run dev

# Frontend will run on http://localhost:3000
```

### 5. (Optional) Seed Demo Data

```bash
# In backend directory
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo
```

**Demo credentials:**
- **Email**: demo@jobtracker.com
- **Password**: demo123

---

## 📱 API Documentation

### Authentication Endpoints (Public)

```
POST /api/auth/signup  - Register new user
POST /api/auth/login   - Login user (returns JWT)
```

**Example Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Example Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Application Endpoints (Protected - JWT Required)

```
GET    /api/applications              - Get all applications (paginated, filterable)
GET    /api/applications/{id}         - Get application by ID
POST   /api/applications              - Create new application
PUT    /api/applications/{id}         - Update application
DELETE /api/applications/{id}         - Delete application
GET    /api/applications/stats        - Get application statistics
GET    /api/applications/status/{status} - Filter by status
```

**Query Parameters for GET /api/applications:**
- `page` (default: 0) - Page number
- `size` (default: 21) - Items per page
- `sortBy` (default: createdAt) - Sort field
- `sortDir` (default: desc) - Sort direction
- `status` - Filter by status
- `location` - Filter by location (partial match)
- `search` - Search in company name and position
- `startDate` - Filter by applied date (from)
- `endDate` - Filter by applied date (to)
- `priority` - Filter by minimum priority

### Company Endpoints (Protected)

```
GET    /api/companies            - Get all companies
GET    /api/companies/search     - Search companies (query param: query)
POST   /api/companies            - Create company
PUT    /api/companies/{id}       - Update company
DELETE /api/companies/{id}       - Delete company
```

### Interview Endpoints (Protected)

```
GET    /api/interviews            - Get all interviews
GET    /api/interviews/upcoming   - Get upcoming interviews
POST   /api/interviews            - Schedule interview
PUT    /api/interviews/{id}       - Update interview
DELETE /api/interviews/{id}       - Delete interview
```

### Document Endpoints (Protected)

```
POST   /api/documents/upload/{applicationId}  - Upload document
GET    /api/documents/application/{applicationId} - Get documents by application
GET    /api/documents/download/{id}            - Download document
DELETE /api/documents/{id}                     - Delete document
```

---

## 🌐 Deployment

### Deploy Backend to Railway

1. **Create Account**: Sign up at [railway.app](https://railway.app)
2. **Create New Project**: Deploy from GitHub repo
3. **Add PostgreSQL**: Click "+ New" → Database → PostgreSQL
4. **Set Environment Variables**:
   ```
   DATABASE_URL=<from PostgreSQL service>
   JWT_SECRET=<generate 64-char random string>
   JWT_EXPIRATION=86400000
   SPRING_PROFILES_ACTIVE=prod
   ```
5. **Deploy**: Railway auto-builds using Dockerfile

### Deploy Frontend to Vercel

1. **Create Account**: Sign up at [vercel.com](https://vercel.com)
2. **Import Project**: Connect GitHub repository
3. **Configure Build**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-railway-backend.railway.app/api
   ```
5. **Deploy**: Vercel auto-deploys on push

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
./mvnw test

# Frontend tests
cd frontend
npm test
```

---

## 📝 Project Structure

```
JobTracker/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/jobtracker/
│   │   │   │   ├── config/          # Security, CORS, WebConfig
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── model/           # JPA entities
│   │   │   │   ├── repository/      # JPA repositories with Specifications
│   │   │   │   ├── security/        # JWT implementation
│   │   │   │   ├── service/         # Business logic layer
│   │   │   │   └── seeder/          # Demo data seeder
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit tests
│   ├── pom.xml
│   ├── Dockerfile
│   └── railway.json
└── frontend/
    ├── src/
    │   ├── components/              # React components
    │   │   ├── AdvancedFilters.jsx
    │   │   ├── ApplicationCard.jsx
    │   │   ├── ApplicationForm.jsx
    │   │   ├── Charts.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── Interview.jsx
    │   │   ├── KanbanBoard.jsx
    │   │   ├── LoadingSkeleton.jsx
    │   │   └── Pagination.jsx
    │   ├── context/                 # React context (Auth)
    │   ├── pages/                   # Page components
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── ApplicationDetails.jsx
    │   ├── utils/                   # API client, helpers
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── vercel.json
```

---

## 📊 Application Status Values

```
SAVED       - Saved for later consideration
APPLIED     - Application submitted
SCREENING   - Phone/initial screening
INTERVIEW   - Interview scheduled/completed
OFFER       - Job offer received
REJECTED    - Application rejected
ACCEPTED    - Offer accepted
WITHDRAWN   - Application withdrawn by user
```

---

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: BCrypt with salt
- **User Isolation**: Users can only access their own data
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: JPA prevents SQL injection
- **Rate Limiting**: Basic protection against brute force (production-ready version recommended)

---

## 🤝 Contributing

This is a personal portfolio project, but suggestions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built as a full-stack portfolio project demonstrating:
- Modern Spring Boot backend architecture
- React frontend with hooks and context
- RESTful API design
- Database modeling and JPA
- JWT authentication
- Responsive UI/UX design
- Deployment to production

---

## 🎓 Acknowledgments

- Built during my own job search journey
- Inspired by the need for better application tracking
- Uses various open-source libraries and frameworks
- Special thanks to the Spring Boot and React communities

---

## 📬 Contact

Questions or feedback? Open an issue or reach out!

---

**⭐ If you find this project helpful, please give it a star!**
