variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance (Ubuntu 24.04 LTS)"
  type        = string
  default     = "ami-0dee22c13ea7a9a67"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  default     = "doctor-channeling-key"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Restrict this in production to your IP
}

# MongoDB Credentials (stored in Secrets Manager)
variable "mongodb_username" {
  description = "MongoDB root username"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "mongodb_password" {
  description = "MongoDB root password"
  type        = string
  sensitive   = true
}

variable "mongodb_database" {
  description = "MongoDB database name"
  type        = string
  default     = "doctor_channeling"
}

# Docker Hub Credentials (for CI/CD)
variable "docker_hub_username" {
  description = "Docker Hub username"
  type        = string
  default     = "thurga1125"
  sensitive   = true
}

variable "docker_hub_password" {
  description = "Docker Hub password"
  type        = string
  sensitive   = true
}

# SNS Topic for Alarms (optional)
variable "sns_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarms"
  type        = string
  default     = ""
}

# Domain name for SSL (optional)
variable "domain_name" {
  description = "Domain name for SSL certificate"
  type        = string
  default     = ""
}

# Email for Let's Encrypt SSL
variable "ssl_email" {
  description = "Email address for Let's Encrypt SSL certificate"
  type        = string
  default     = ""
}
