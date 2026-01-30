#!/bin/bash
# MongoDB Backup Script with S3 Upload
# This script creates a MongoDB backup and uploads it to S3

set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mongodb_backup_$DATE"
BACKUP_DIR="/tmp/mongodb-backups"
AWS_REGION="${AWS_REGION:-eu-north-1}"
S3_BUCKET="${S3_BUCKET:-doctor-channeling-mongodb-backups-production}"
SECRET_ARN="${MONGODB_SECRET_ARN:-doctor-channeling/mongodb-credentials}"
CONTAINER_NAME="mongodb"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    error "Docker is not running or you don't have permission to access it"
    exit 1
fi

# Check if MongoDB container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    error "MongoDB container '${CONTAINER_NAME}' is not running"
    exit 1
fi

log "Starting MongoDB backup process..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get MongoDB credentials from AWS Secrets Manager
log "Fetching MongoDB credentials from AWS Secrets Manager..."
MONGO_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_ARN" \
    --region "$AWS_REGION" \
    --query SecretString \
    --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    warn "Could not fetch credentials from Secrets Manager, using environment variables"
    MONGO_USERNAME="${MONGO_ROOT_USERNAME:-admin}"
    MONGO_PASSWORD="${MONGO_ROOT_PASSWORD:-adminpass}"
    MONGO_DATABASE="${MONGO_DATABASE:-doctor_channeling}"
else
    MONGO_USERNAME=$(echo "$MONGO_SECRET" | jq -r '.username')
    MONGO_PASSWORD=$(echo "$MONGO_SECRET" | jq -r '.password')
    MONGO_DATABASE=$(echo "$MONGO_SECRET" | jq -r '.database')
    log "Credentials retrieved successfully"
fi

# Perform MongoDB dump
log "Creating MongoDB backup..."
docker exec "$CONTAINER_NAME" mongodump \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    --db="$MONGO_DATABASE" \
    --out="/tmp/backup" \
    --quiet

if [ $? -ne 0 ]; then
    error "MongoDB backup failed"
    exit 1
fi

log "Backup created successfully"

# Create compressed archive
log "Compressing backup..."
docker exec "$CONTAINER_NAME" tar -czf "/tmp/${BACKUP_NAME}.tar.gz" -C /tmp/backup .

if [ $? -ne 0 ]; then
    error "Compression failed"
    exit 1
fi

# Copy archive from container to host
log "Copying backup from container..."
docker cp "${CONTAINER_NAME}:/tmp/${BACKUP_NAME}.tar.gz" "$BACKUP_DIR/"

if [ $? -ne 0 ]; then
    error "Failed to copy backup from container"
    exit 1
fi

# Get backup file size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Upload to S3
log "Uploading backup to S3..."
aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" \
    "s3://$S3_BUCKET/backups/${BACKUP_NAME}.tar.gz" \
    --region "$AWS_REGION" \
    --storage-class STANDARD_IA \
    --metadata "backup-date=$DATE,database=$MONGO_DATABASE"

if [ $? -ne 0 ]; then
    error "Failed to upload backup to S3"
    exit 1
fi

log "Backup uploaded successfully to S3"

# Cleanup local backup
log "Cleaning up local files..."
rm -rf "$BACKUP_DIR"

# Cleanup container temporary files
docker exec "$CONTAINER_NAME" rm -rf /tmp/backup "/tmp/${BACKUP_NAME}.tar.gz" 2>/dev/null || true

log "Cleanup completed"

# Send success metric to CloudWatch
log "Sending metrics to CloudWatch..."
aws cloudwatch put-metric-data \
    --namespace DoctorChanneling \
    --metric-name BackupStatus \
    --value 1 \
    --region "$AWS_REGION" \
    --dimensions Service=MongoDB,Environment=production \
    --timestamp "$(date -u +%Y-%m-%dT%H:%M:%S)" 2>/dev/null || warn "Failed to send CloudWatch metric"

# List recent backups
log "Recent backups in S3:"
aws s3 ls "s3://$S3_BUCKET/backups/" --region "$AWS_REGION" --human-readable | tail -5

log "Backup process completed successfully: ${BACKUP_NAME}.tar.gz"

# Return success
exit 0
