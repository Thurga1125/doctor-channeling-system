# IAM Role for EC2 Instance
resource "aws_iam_role" "ec2_role" {
  name = "doctor-channeling-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "doctor-channeling-ec2-role"
    Environment = var.environment
  }
}

# IAM Policy for Secrets Manager Access
resource "aws_iam_role_policy" "secrets_manager_policy" {
  name = "secrets-manager-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.mongodb_credentials.arn
      }
    ]
  })
}

# IAM Policy for CloudWatch Logs
resource "aws_iam_role_policy" "cloudwatch_policy" {
  name = "cloudwatch-logs-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:${aws_cloudwatch_log_group.app_logs.name}:*"
      }
    ]
  })
}

# IAM Policy for S3 Backup Access
resource "aws_iam_role_policy" "s3_backup_policy" {
  name = "s3-backup-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.mongodb_backups.arn,
          "${aws_s3_bucket.mongodb_backups.arn}/*"
        ]
      }
    ]
  })
}

# IAM Policy for CloudWatch Metrics
resource "aws_iam_role_policy" "cloudwatch_metrics_policy" {
  name = "cloudwatch-metrics-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricData",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "doctor-channeling-ec2-profile"
  role = aws_iam_role.ec2_role.name

  tags = {
    Name        = "doctor-channeling-ec2-profile"
    Environment = var.environment
  }
}
