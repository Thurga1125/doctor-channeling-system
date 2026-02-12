# EC2 Instance Outputs
output "ec2_instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "private_ip" {
  description = "Private IP of the EC2 instance"
  value       = aws_instance.app.private_ip
}

# Security Group Outputs
output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.app_sg.id
}

# IAM Role Outputs
output "ec2_iam_role_name" {
  description = "IAM role name for EC2 instance"
  value       = aws_iam_role.ec2_role.name
}

output "ec2_iam_role_arn" {
  description = "IAM role ARN for EC2 instance"
  value       = aws_iam_role.ec2_role.arn
}

# Secrets Manager Outputs
output "mongodb_secret_arn" {
  description = "ARN of MongoDB credentials secret"
  value       = aws_secretsmanager_secret.mongodb_credentials.arn
  sensitive   = true
}

# S3 Backup Bucket Output
output "backup_bucket_name" {
  description = "Name of the S3 bucket for MongoDB backups"
  value       = aws_s3_bucket.mongodb_backups.bucket
}

# CloudWatch Log Group Output
output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.app_logs.name
}

# Ansible Inventory Output
output "ansible_inventory" {
  description = "Ansible inventory format output"
  value = templatefile("${path.module}/templates/inventory.tpl", {
    instance_ip  = aws_instance.app.public_ip
    ssh_key_path = "~/.ssh/${var.key_name}.pem"
  })
}

# AMI used
output "ami_id" {
  description = "AMI ID used for the EC2 instance"
  value       = data.aws_ami.ubuntu.id
}

# Application URLs
output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_instance.app.public_ip}:3000"
}

output "backend_api_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.app.public_ip}:8080/api"
}

output "jenkins_url" {
  description = "Jenkins URL"
  value       = "http://${aws_instance.app.public_ip}:8082"
}

output "swagger_ui_url" {
  description = "Swagger UI URL"
  value       = "http://${aws_instance.app.public_ip}:8080/swagger-ui.html"
}
