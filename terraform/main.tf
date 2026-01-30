provider "aws" {
  region = var.aws_region
}

# Security Group for the application
resource "aws_security_group" "app_sg" {
  name        = "doctor-channeling-sg"
  description = "Security group for Doctor Channeling application"

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_cidr_blocks
  }

  # HTTP access (Frontend)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend dev port
  ingress {
    description = "Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API port
  ingress {
    description = "Backend API"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "doctor-channeling-sg"
    Environment = var.environment
  }
}

# EC2 Instance
resource "aws_instance" "app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    aws_region           = var.aws_region
    environment          = var.environment
    mongodb_secret_arn   = aws_secretsmanager_secret.mongodb_credentials.arn
    log_group_name       = aws_cloudwatch_log_group.app_logs.name
    backup_bucket_name   = aws_s3_bucket.mongodb_backups.bucket
  })

  tags = {
    Name        = "Doctor-Channeling-Server"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy.secrets_manager_policy,
    aws_iam_role_policy.cloudwatch_policy,
    aws_iam_role_policy.s3_backup_policy
  ]
}

# Outputs moved to outputs.tf
