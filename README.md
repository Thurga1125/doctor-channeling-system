# Doctor Channeling System

A full-stack doctor appointment booking system for **Mediland Hospital - Kalmunai**.

## Features

- **Patient Portal**: Browse doctors, book appointments, manage bookings
- **Admin Dashboard**: Manage doctors, appointments, and users
- **Payment Options**: Full payment, half payment, or pay at visit
- **Real-time Status**: Track appointment status (Pending, Confirmed, Completed, Cancelled)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router, Axios |
| Backend | Spring Boot 3.2, Spring Security, Spring Data MongoDB |
| Database | MongoDB 7.0 |
| DevOps | Docker, Jenkins, Terraform, Ansible |
| Cloud | AWS EC2 |

## Project Structure

```
doctor-channeling-system/
├── Frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── context/         # React context (Auth)
│   └── Dockerfile
├── Backend/                  # Spring Boot application
│   ├── src/main/java/com/doctorchannel/
│   │   ├── controller/      # REST controllers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # MongoDB repositories
│   │   ├── model/           # Entity models
│   │   └── config/          # Configuration classes
│   └── Dockerfile
├── terraform/               # Infrastructure as Code
├── ansible/                 # Configuration management
├── docker-compose.yml       # Local development setup
└── Jenkinsfile             # CI/CD pipeline
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17+ (for local backend development)
- MongoDB 7.0 (or use Docker)

### Local Development with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/Thurga1125/doctor-channeling-system.git
   cd doctor-channeling-system
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred MongoDB credentials
   ```

3. **Start all services**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Docs: http://localhost:8080/swagger-ui.html

### Local Development (Without Docker)

**Backend:**
```bash
cd Backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd Frontend
npm install
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors |
| GET | `/api/doctors/{id}` | Get doctor by ID |
| GET | `/api/doctors/search?specialty=` | Search by specialty |
| GET | `/api/doctors/search?name=` | Search by name |
| GET | `/api/doctors/search?city=` | Search by city |
| POST | `/api/doctors` | Create doctor (Admin) |
| PUT | `/api/doctors/{id}` | Update doctor (Admin) |
| DELETE | `/api/doctors/{id}` | Delete doctor (Admin) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/{id}` | Get appointment by ID |
| GET | `/api/appointments/user/{userId}` | Get user's appointments |
| GET | `/api/appointments/doctor/{doctorId}` | Get doctor's appointments |
| POST | `/api/appointments` | Book appointment |
| PUT | `/api/appointments/{id}/status` | Update status |
| DELETE | `/api/appointments/{id}` | Cancel appointment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/{id}` | Get user by ID |
| DELETE | `/api/users/{id}` | Delete user (Admin) |

## Deployment

### AWS Deployment with Terraform

1. **Configure AWS credentials**
   ```bash
   aws configure
   ```

2. **Create EC2 key pair**
   ```bash
   aws ec2 create-key-pair --key-name doctor-channeling-key \
     --query 'KeyMaterial' --output text > ~/.ssh/doctor-channeling-key.pem
   chmod 400 ~/.ssh/doctor-channeling-key.pem
   ```

3. **Deploy infrastructure**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values

   terraform init
   terraform plan
   terraform apply
   ```

4. **Configure server with Ansible**
   ```bash
   cd ../ansible
   # Update inventory.ini with EC2 public IP from Terraform output

   ansible-playbook -i inventory.ini playbook.yml
   ```

### CI/CD with Jenkins

The Jenkinsfile includes:
- Code checkout from GitHub
- Terraform & Ansible validation
- Backend build & test (Maven)
- Frontend build & test (npm)
- Docker image build & push to Docker Hub
- Deployment to EC2
- Health checks

**Required Jenkins Credentials:**
- `docker-hub-credentials` - Docker Hub username/password
- `ec2-host-ip` - EC2 public IP (secret text)
- `ec2-ssh-key` - SSH private key for EC2

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB admin username | admin |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password | (required) |
| `MONGO_DATABASE` | Database name | doctor_channeling |
| `SPRING_DATA_MONGODB_URI` | MongoDB connection URI | (auto-configured) |

## Default Admin Account

After initial setup, create an admin user via API or MongoDB:

```javascript
// In MongoDB shell
db.users.insertOne({
  email: "admin@mediland.com",
  password: "$2a$10$...", // BCrypt hash of your password
  fullName: "Admin",
  role: "ADMIN",
  isActive: true
})
```

## Health Checks

- Backend: `http://localhost:8080/actuator/health`
- Frontend: `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is proprietary software for Mediland Hospital - Kalmunai.

## Contact

- **Hospital**: Mediland Hospital, Kalmunai
- **Admin Contact**: 0776975495
