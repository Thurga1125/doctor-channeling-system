#!/bin/bash
# Script to setup Terraform S3 backend and DynamoDB table
# Run this script BEFORE terraform init

set -e

# Configuration
AWS_REGION="eu-north-1"
S3_BUCKET="doctor-channeling-terraform-state"
DYNAMODB_TABLE="doctor-channeling-terraform-locks"
ENVIRONMENT="production"

echo "=========================================="
echo "Terraform Backend Setup Script"
echo "=========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

echo "AWS credentials OK"
echo ""

# Create S3 bucket for Terraform state
echo "Creating S3 bucket: $S3_BUCKET in region $AWS_REGION..."
if aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3api create-bucket \
        --bucket "$S3_BUCKET" \
        --region "$AWS_REGION" \
        --create-bucket-configuration LocationConstraint="$AWS_REGION"

    echo "S3 bucket created successfully"
else
    echo "S3 bucket already exists"
fi

# Enable versioning on the S3 bucket
echo "Enabling versioning on S3 bucket..."
aws s3api put-bucket-versioning \
    --bucket "$S3_BUCKET" \
    --versioning-configuration Status=Enabled \
    --region "$AWS_REGION"

# Enable encryption on the S3 bucket
echo "Enabling encryption on S3 bucket..."
aws s3api put-bucket-encryption \
    --bucket "$S3_BUCKET" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' \
    --region "$AWS_REGION"

# Block public access
echo "Blocking public access to S3 bucket..."
aws s3api put-public-access-block \
    --bucket "$S3_BUCKET" \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region "$AWS_REGION"

# Add tags to S3 bucket
echo "Adding tags to S3 bucket..."
aws s3api put-bucket-tagging \
    --bucket "$S3_BUCKET" \
    --tagging "TagSet=[{Key=Name,Value=terraform-state},{Key=Environment,Value=$ENVIRONMENT},{Key=ManagedBy,Value=terraform}]" \
    --region "$AWS_REGION"

echo "S3 bucket configuration complete"
echo ""

# Create DynamoDB table for state locking
echo "Creating DynamoDB table: $DYNAMODB_TABLE in region $AWS_REGION..."
if ! aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" --region "$AWS_REGION" &> /dev/null; then
    aws dynamodb create-table \
        --table-name "$DYNAMODB_TABLE" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION" \
        --tags Key=Name,Value=terraform-locks Key=Environment,Value="$ENVIRONMENT" Key=ManagedBy,Value=terraform

    echo "DynamoDB table created successfully"
    echo "Waiting for table to become active..."
    aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE" --region "$AWS_REGION"
else
    echo "DynamoDB table already exists"
fi

echo ""
echo "=========================================="
echo "Backend Setup Complete!"
echo "=========================================="
echo ""
echo "S3 Bucket: $S3_BUCKET"
echo "DynamoDB Table: $DYNAMODB_TABLE"
echo "Region: $AWS_REGION"
echo ""
echo "Next steps:"
echo "1. Review terraform/backend.tf configuration"
echo "2. Run: cd terraform && terraform init"
echo "3. Terraform will migrate your state to S3 backend"
echo ""
