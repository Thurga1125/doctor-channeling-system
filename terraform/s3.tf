# S3 Bucket for MongoDB Backups
resource "aws_s3_bucket" "mongodb_backups" {
  bucket = "doctor-channeling-mongodb-backups-${var.environment}"

  tags = {
    Name        = "doctor-channeling-mongodb-backups"
    Environment = var.environment
    Purpose     = "MongoDB Backups"
  }
}

# Enable versioning for backup history
resource "aws_s3_bucket_versioning" "mongodb_backups" {
  bucket = aws_s3_bucket.mongodb_backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption for backups
resource "aws_s3_bucket_server_side_encryption_configuration" "mongodb_backups" {
  bucket = aws_s3_bucket.mongodb_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Lifecycle policy for backup retention
resource "aws_s3_bucket_lifecycle_configuration" "mongodb_backups" {
  bucket = aws_s3_bucket.mongodb_backups.id

  rule {
    id     = "delete-old-backups"
    status = "Enabled"

    expiration {
      days = 30  # Keep backups for 30 days
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 7
      storage_class = "GLACIER"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "mongodb_backups" {
  bucket = aws_s3_bucket.mongodb_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
