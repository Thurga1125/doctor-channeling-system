# AWS Secrets Manager for MongoDB Credentials
resource "aws_secretsmanager_secret" "mongodb_credentials" {
  name        = "doctor-channeling/mongodb-credentials"
  description = "MongoDB credentials for Doctor Channeling application"

  recovery_window_in_days = 7

  tags = {
    Name        = "doctor-channeling-mongodb-secret"
    Environment = var.environment
  }
}

# Secret Version with MongoDB Credentials
resource "aws_secretsmanager_secret_version" "mongodb_credentials" {
  secret_id = aws_secretsmanager_secret.mongodb_credentials.id

  secret_string = jsonencode({
    username = var.mongodb_username
    password = var.mongodb_password
    database = var.mongodb_database
    uri      = "mongodb://${var.mongodb_username}:${var.mongodb_password}@mongodb:27017/${var.mongodb_database}?authSource=admin"
  })
}

# Secret for Docker Hub Credentials (optional for Jenkins)
resource "aws_secretsmanager_secret" "docker_hub_credentials" {
  name        = "doctor-channeling/docker-hub-credentials"
  description = "Docker Hub credentials for CI/CD"

  recovery_window_in_days = 7

  tags = {
    Name        = "doctor-channeling-dockerhub-secret"
    Environment = var.environment
  }
}

# Secret Version for Docker Hub (to be populated manually)
resource "aws_secretsmanager_secret_version" "docker_hub_credentials" {
  secret_id = aws_secretsmanager_secret.docker_hub_credentials.id

  secret_string = jsonencode({
    username = var.docker_hub_username
    password = var.docker_hub_password
  })
}
