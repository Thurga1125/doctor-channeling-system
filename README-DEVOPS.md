# Doctor Channeling System - DevOps Documentation

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Docker](https://img.shields.io/badge/Docker-enabled-blue)
![Terraform](https://img.shields.io/badge/Terraform-IaC-purple)
![AWS](https://img.shields.io/badge/AWS-Cloud-orange)

> Complete Production-Ready DevOps Implementation for Doctor Channeling System

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Setup](#infrastructure-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Security](#security)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project is a full-stack doctor appointment booking system with enterprise-grade DevOps implementation including:

- **Containerization**: Docker & Docker Compose
- **Infrastructure as Code**: Terraform
- **Configuration Management**: Ansible
- **CI/CD**: Jenkins with automated testing and deployment
- **Cloud Platform**: AWS (EC2, S3, Secrets Manager, CloudWatch)
- **Monitoring**: CloudWatch metrics, alarms, and dashboards
- **Security**: AWS Secrets Manager, IAM roles, SSL/TLS support
- **Backup**: Automated MongoDB backups to S3

### Tech Stack

- **Frontend**: React 18, Nginx
- **Backend**: Spring Boot 3.2, Java 17
- **Database**: MongoDB 7.0
- **Cloud**: AWS
- **DevOps**: Docker, Terraform, Ansible, Jenkins

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │  Route  │
                    │   53    │  (Optional DNS)
                    └────┬────┘
                         │
                    ┌────▼────────────────────────────────┐
                    │      AWS EC2 Instance               │
                    │  ┌──────────────────────────────┐   │
                    │  │     Docker Compose           │   │
                    │  │  ┌────────────────────────┐  │   │
                    │  │  │  Frontend (Nginx)      │  │   │
                    │  │  │  Port: 80/443          │  │   │
                    │  │  └──────────┬─────────────┘  │   │
                    │  │             │                 │   │
                    │  │  ┌──────────▼─────────────┐  │   │
                    │  │  │  Backend (Spring Boot) │  │   │
                    │  │  │  Port: 8080            │  │   │
                    │  │  └──────────┬─────────────┘  │   │
                    │  │             │                 │   │
                    │  │  ┌──────────▼─────────────┐  │   │
                    │  │  │  MongoDB 7.0           │  │   │
                    │  │  │  Port: 27017           │  │   │
                    │  │  └────────────────────────┘  │   │
                    │  └──────────────────────────────┘   │
                    │                                      │
                    │  CloudWatch Agent (Metrics/Logs)    │
                    └──────────────┬───────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
     ┌────────▼────────┐                    ┌──────────▼─────────┐
     │   S3 Bucket     │                    │  CloudWatch        │
     │  (Backups)      │                    │  (Monitoring)      │
     └─────────────────┘                    └────────────────────┘
              │                                         │
     ┌────────▼────────┐                    ┌──────────▼─────────┐
     │ Secrets Manager │                    │  CloudWatch        │
     │  (Credentials)  │                    │   Alarms           │
     └─────────────────┘                    └────────────────────┘
```

---

## ✅ Prerequisites

### Required Tools

1. **AWS CLI** (v2.x)
   ```bash
   aws --version
   ```

2. **Terraform** (v1.0+)
   ```bash
   terraform version
   ```

3. **Ansible** (v2.9+)
   ```bash
   ansible --version
   ```

4. **Docker** & **Docker Compose**
   ```bash
   docker --version
   docker-compose --version
   ```

5. **Git**
   ```bash
   git --version
   ```

### AWS Requirements

- AWS Account with appropriate permissions
- IAM user with programmatic access
- AWS CLI configured with credentials:
  ```bash
  aws configure
  ```

### Required AWS Permissions

Your IAM user needs permissions for:
- EC2 (create/manage instances, security groups)
- S3 (create/manage buckets)
- DynamoDB (create/manage tables)
- Secrets Manager (create/manage secrets)
- CloudWatch (create metrics, alarms, dashboards)
- IAM (create roles and policies)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Thurga1125/doctor-channeling-system.git
cd doctor-channeling-system
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., eu-north-1)
```

### 3. Setup Terraform Backend

```bash
cd scripts
./setup-terraform-backend.sh
cd ..
```

### 4. Configure Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
vim terraform.tfvars
```

### 5. Create SSH Key Pair

```bash
# Create SSH key pair in AWS
aws ec2 create-key-pair \\
    --key-name doctor-channeling-key \\
    --query 'KeyMaterial' \\
    --output text > ~/.ssh/doctor-channeling-key.pem

chmod 400 ~/.ssh/doctor-channeling-key.pem
```

### 6. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
```

### 7. Generate Ansible Inventory

```bash
cd ../scripts
./generate-ansible-inventory.sh
cd ..
```

### 8. Deploy Application with Ansible

```bash
cd ansible

# For HTTP deployment
ansible-playbook -i inventory.ini playbook.yml

# For HTTPS deployment (if you have a domain)
export DOMAIN_NAME="your-domain.com"
export SSL_EMAIL="your-email@example.com"
ansible-playbook -i inventory.ini playbook-ssl.yml
```

### 9. Access Your Application

Get the public IP from Terraform outputs:
```bash
cd terraform
terraform output public_ip
```

Access the application:
- **Frontend**: `http://YOUR_EC2_IP:3000`
- **Backend API**: `http://YOUR_EC2_IP:8080`
- **Swagger UI**: `http://YOUR_EC2_IP:8080/swagger-ui.html`
- **Health Check**: `http://YOUR_EC2_IP:8080/actuator/health`

---

## 🏗️ Infrastructure Setup

### Terraform Components

The infrastructure includes:

#### 1. EC2 Instance
- Ubuntu 24.04 LTS
- Instance type: t3.micro
- 20GB gp3 storage
- IAM instance profile for AWS service access
- CloudWatch agent installed
- User data script for initial setup

#### 2. Security Group
- SSH (22): Restricted to your IP
- HTTP (80): Open to internet
- HTTPS (443): Open to internet
- Frontend (3000): Open to internet
- Backend (8080): Open to internet

#### 3. IAM Roles & Policies
- EC2 instance role
- Secrets Manager access
- S3 backup access
- CloudWatch logs and metrics access

#### 4. S3 Bucket
- Encrypted MongoDB backups
- Versioning enabled
- Lifecycle policies (30-day retention, 7-day Glacier transition)
- Public access blocked

#### 5. Secrets Manager
- MongoDB credentials
- Docker Hub credentials
- Encrypted at rest

#### 6. CloudWatch
- Log groups for application logs
- Metrics and alarms for:
  - CPU utilization
  - Memory usage
  - Disk space
  - Instance status
  - Application health
- CloudWatch dashboard

### Terraform Commands

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt

# Plan deployment
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List outputs
terraform output

# Destroy infrastructure
terraform destroy
```

---

## 🔄 CI/CD Pipeline

### Jenkins Pipeline Stages

The Jenkins pipeline (`Jenkinsfile-enhanced`) includes:

1. **Checkout**: Clone code from GitHub
2. **Validate Infrastructure**: Terraform, Ansible, Dockerfile linting
3. **Security Scan**: Dependency checks for frontend and backend
4. **Build & Test Backend**: Maven build and JUnit tests
5. **Build & Test Frontend**: npm build and Jest tests
6. **Build Docker Images**: Multi-stage builds with tags
7. **Image Security Scan**: Trivy vulnerability scanning
8. **Push to Docker Hub**: Tagged images (latest + build number)
9. **Backup Before Deploy**: MongoDB backup to S3
10. **Deploy to EC2**: Pull images and restart containers
11. **Health Check**: Verify application health
12. **Post-Deployment Tests**: Smoke tests and performance baseline
13. **Send Metrics**: CloudWatch deployment metrics

### Jenkins Configuration

#### Required Credentials

Configure these credentials in Jenkins:

1. **docker-hub-credentials**
   - Type: Username with password
   - Username: Your Docker Hub username
   - Password: Docker Hub access token

2. **aws-credentials**
   - Type: AWS credentials
   - Access Key ID: Your AWS access key
   - Secret Access Key: Your AWS secret key

3. **ec2-host-ip**
   - Type: Secret text
   - Value: EC2 instance public IP

4. **ec2-ssh-key**
   - Type: SSH Username with private key
   - Username: ubuntu
   - Private key: Contents of your .pem file

#### Jenkins Plugins Required

- Pipeline
- Git
- Docker Pipeline
- AWS Steps
- SSH Agent
- JUnit
- JaCoCo
- HTML Publisher

#### Jenkins Setup

```bash
# Install Jenkins plugins
# Go to Manage Jenkins > Manage Plugins

# Configure Jenkins credentials
# Go to Manage Jenkins > Manage Credentials

# Create new pipeline job
# Go to New Item > Pipeline
# Configure SCM: GitHub repository
# Script Path: Jenkinsfile-enhanced
```

---

## 📊 Monitoring & Logging

### CloudWatch Metrics

Custom metrics sent to CloudWatch:

1. **Application Health**
   - Metric: `HealthCheckStatus`
   - Namespace: `DoctorChanneling`
   - Frequency: Every minute

2. **Backup Status**
   - Metric: `BackupStatus`
   - Namespace: `DoctorChanneling`
   - Frequency: Daily at 2 AM

3. **CI/CD Metrics**
   - Metric: `DeploymentSuccess` / `DeploymentFailure`
   - Namespace: `DoctorChanneling/CI-CD`
   - Frequency: Per deployment

### CloudWatch Alarms

Configured alarms:

1. **High CPU** - Triggers when CPU > 80% for 10 minutes
2. **High Memory** - Triggers when memory > 80% for 10 minutes
3. **Low Disk Space** - Triggers when disk > 85%
4. **Instance Status Check** - Triggers on instance failures
5. **Application Health** - Triggers when health check fails

### CloudWatch Dashboard

Access your dashboard:
```bash
# Get dashboard URL
aws cloudwatch list-dashboards --region eu-north-1
```

Dashboard includes:
- CPU utilization graph
- Memory usage graph
- Disk usage graph
- Recent application logs

### Application Logs

Logs are stored in:
- **Container logs**: `docker logs <container-name>`
- **File logs**: `/home/ubuntu/doctor-channeling-system/logs/`
- **CloudWatch Logs**: Log group `/aws/doctor-channeling/production`

View logs:
```bash
# Docker logs
docker logs -f backend
docker logs -f frontend
docker logs -f mongodb

# File logs
tail -f /home/ubuntu/doctor-channeling-system/logs/backend.log
tail -f /home/ubuntu/doctor-channeling-system/logs/nginx.log

# CloudWatch logs
aws logs tail /aws/doctor-channeling/production --follow
```

---

## 🔐 Security

### Security Best Practices Implemented

1. **Secrets Management**
   - All credentials in AWS Secrets Manager
   - No hardcoded passwords in code
   - Environment-based secret injection

2. **Network Security**
   - Security groups with minimal required ports
   - SSH access restricted to specific IPs
   - UFW firewall enabled on EC2

3. **Container Security**
   - Non-root users in containers
   - Multi-stage Docker builds
   - Image vulnerability scanning with Trivy
   - Resource limits configured

4. **IAM Security**
   - Least privilege principle
   - Instance profiles for EC2
   - No long-term credentials on instances

5. **Data Security**
   - S3 encryption at rest
   - Secrets Manager encryption
   - HTTPS/TLS support with Let's Encrypt

6. **Backup Security**
   - Encrypted backups in S3
   - Versioning enabled
   - Access restricted via IAM

### SSL/TLS Configuration

To enable HTTPS:

1. **Obtain a domain name**

2. **Update terraform.tfvars**:
   ```hcl
   domain_name = "your-domain.com"
   ssl_email   = "your-email@example.com"
   ```

3. **Point DNS to EC2 IP**:
   - Create A record pointing to EC2 public IP

4. **Deploy with SSL playbook**:
   ```bash
   export DOMAIN_NAME="your-domain.com"
   export SSL_EMAIL="your-email@example.com"
   ansible-playbook -i inventory.ini playbook-ssl.yml
   ```

5. **Certificate auto-renewal**:
   - Cron job configured for monthly renewal
   - Certbot renews certificates automatically

---

## 💾 Backup & Recovery

### Automated Backups

MongoDB backups run automatically:
- **Schedule**: Daily at 2:00 AM
- **Location**: S3 bucket `doctor-channeling-mongodb-backups-production`
- **Retention**: 30 days (then moved to Glacier)
- **Compression**: gzip
- **Encryption**: AES256

### Manual Backup

```bash
# SSH to EC2 instance
ssh -i ~/.ssh/doctor-channeling-key.pem ubuntu@YOUR_EC2_IP

# Run backup script
sudo /usr/local/bin/backup-mongodb.sh
```

### Restore from Backup

```bash
# SSH to EC2 instance
ssh -i ~/.ssh/doctor-channeling-key.pem ubuntu@YOUR_EC2_IP

# List available backups
aws s3 ls s3://doctor-channeling-mongodb-backups-production/backups/ \\
    --region eu-north-1 \\
    --human-readable

# Restore specific backup
sudo /usr/local/bin/restore-mongodb.sh mongodb_backup_YYYYMMDD_HHMMSS.tar.gz
```

### Disaster Recovery Plan

1. **Infrastructure Failure**:
   ```bash
   cd terraform
   terraform destroy
   terraform apply  # Recreates infrastructure
   ```

2. **Application Failure**:
   ```bash
   docker-compose restart
   # or
   docker-compose down && docker-compose up -d
   ```

3. **Data Loss**:
   ```bash
   # Restore from latest backup
   /usr/local/bin/restore-mongodb.sh <backup-file>
   ```

4. **Complete Recovery**:
   - Recreate infrastructure with Terraform
   - Deploy application with Ansible
   - Restore database from S3 backup

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Terraform State Locked

**Problem**: `Error: Error acquiring the state lock`

**Solution**:
```bash
# Force unlock (use with caution)
terraform force-unlock <LOCK_ID>
```

#### 2. Docker Container Fails to Start

**Problem**: Container exits immediately

**Solution**:
```bash
# Check container logs
docker logs <container-name>

# Check compose logs
docker-compose logs -f

# Restart containers
docker-compose restart
```

#### 3. MongoDB Connection Error

**Problem**: Backend can't connect to MongoDB

**Solution**:
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs mongodb

# Verify credentials in Secrets Manager
aws secretsmanager get-secret-value \\
    --secret-id doctor-channeling/mongodb-credentials \\
    --region eu-north-1
```

#### 4. Health Check Fails

**Problem**: Jenkins health check stage fails

**Solution**:
```bash
# Manual health check
curl http://YOUR_EC2_IP:8080/actuator/health
curl http://YOUR_EC2_IP:3000

# Check if services are running
docker ps

# Check resource usage
docker stats
```

#### 5. SSL Certificate Issues

**Problem**: Certbot fails to obtain certificate

**Solution**:
```bash
# Check DNS resolution
nslookup your-domain.com

# Ensure port 80 is accessible
curl http://your-domain.com/.well-known/acme-challenge/test

# Manual certificate request
sudo certbot certonly --standalone -d your-domain.com
```

### Logs to Check

```bash
# System logs
sudo journalctl -u docker -f

# Application logs
tail -f /home/ubuntu/doctor-channeling-system/logs/*.log

# CloudWatch agent logs
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

# Backup logs
tail -f /var/log/mongodb-backup.log
```

### Performance Tuning

```bash
# Check resource usage
docker stats

# Adjust Java heap size (in docker-compose.yml)
JAVA_OPTS: "-Xmx512m -Xms256m"

# Adjust MongoDB memory (in docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 1024M
```

---

## 📁 Project Structure

```
doctor-channeling-system/
├── Frontend/               # React application
│   ├── src/
│   ├── Dockerfile
│   └── .dockerignore
├── Backend/                # Spring Boot application
│   ├── src/
│   ├── Dockerfile
│   └── .dockerignore
├── terraform/              # Infrastructure as Code
│   ├── main.tf            # Main configuration
│   ├── variables.tf       # Variable definitions
│   ├── outputs.tf         # Output values
│   ├── backend.tf         # Remote state config
│   ├── iam.tf            # IAM roles and policies
│   ├── secrets.tf        # Secrets Manager
│   ├── s3.tf             # S3 backup bucket
│   ├── monitoring.tf     # CloudWatch config
│   ├── user_data.sh      # EC2 initialization script
│   └── templates/        # Template files
├── ansible/               # Configuration management
│   ├── playbook.yml      # Main playbook
│   ├── playbook-ssl.yml  # SSL-enabled playbook
│   └── inventory.ini     # Inventory file
├── nginx/                 # Nginx configurations
│   ├── nginx-http.conf   # HTTP config
│   └── nginx-ssl.conf    # HTTPS config
├── scripts/               # Utility scripts
│   ├── setup-terraform-backend.sh
│   ├── generate-ansible-inventory.sh
│   ├── backup-mongodb.sh
│   └── restore-mongodb.sh
├── docker-compose.yml              # Development compose
├── docker-compose-production.yml   # Production compose
├── Jenkinsfile                     # Original pipeline
├── Jenkinsfile-enhanced            # Enhanced pipeline
├── .gitignore
└── README-DEVOPS.md              # This file
```

---

## 📚 Additional Resources

### Documentation

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [AWS Documentation](https://docs.aws.amazon.com/)

### Commands Reference

#### Docker Commands
```bash
docker ps                          # List running containers
docker ps -a                       # List all containers
docker logs -f <container>         # Follow container logs
docker exec -it <container> bash   # Enter container shell
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose restart            # Restart services
docker system prune -af           # Clean up everything
```

#### Terraform Commands
```bash
terraform init                    # Initialize
terraform plan                    # Preview changes
terraform apply                   # Apply changes
terraform destroy                 # Destroy resources
terraform state list              # List resources
terraform output                  # Show outputs
```

#### AWS CLI Commands
```bash
aws ec2 describe-instances        # List EC2 instances
aws s3 ls                        # List S3 buckets
aws logs tail <log-group>        # Tail CloudWatch logs
aws secretsmanager get-secret-value # Get secret
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes.

---

## 👤 Author

**Thurgarajinathan**
- GitHub: [@Thurga1125](https://github.com/Thurga1125)
- Docker Hub: [thurga1125](https://hub.docker.com/u/thurga1125)

---

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Docker Inc.
- HashiCorp (Terraform)
- Red Hat (Ansible)
- AWS
- Jenkins Community

---

**Made with ❤️ for DevOps Excellence**
