#!/bin/bash
# MongoDB Restore Script from S3
# This script restores a MongoDB backup from S3

set -e

# Configuration
AWS_REGION="${AWS_REGION:-eu-north-1}"
S3_BUCKET="${S3_BUCKET:-doctor-channeling-mongodb-backups-production}"
SECRET_ARN="${MONGODB_SECRET_ARN:-doctor-channeling/mongodb-credentials}"
CONTAINER_NAME="mongodb"
RESTORE_DIR="/tmp/mongodb-restore"

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

# Check if backup file is provided
if [ -z "$1" ]; then
    error "Usage: $0 <backup-filename>"
    echo "Example: $0 mongodb_backup_20240128_020000.tar.gz"
    echo ""
    log "Available backups in S3:"
    aws s3 ls "s3://$S3_BUCKET/backups/" --region "$AWS_REGION" --human-readable | tail -10
    exit 1
fi

BACKUP_FILE="$1"

log "Starting MongoDB restore process..."

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

# Create restore directory
mkdir -p "$RESTORE_DIR"

# Download backup from S3
log "Downloading backup from S3..."
aws s3 cp "s3://$S3_BUCKET/backups/$BACKUP_FILE" \
    "$RESTORE_DIR/$BACKUP_FILE" \
    --region "$AWS_REGION"

if [ $? -ne 0 ]; then
    error "Failed to download backup from S3"
    exit 1
fi

log "Backup downloaded successfully"

# Copy backup to container
log "Copying backup to MongoDB container..."
docker cp "$RESTORE_DIR/$BACKUP_FILE" "${CONTAINER_NAME}:/tmp/"

# Extract backup in container
log "Extracting backup..."
docker exec "$CONTAINER_NAME" tar -xzf "/tmp/$BACKUP_FILE" -C /tmp/

# Get MongoDB credentials
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
fi

# Restore MongoDB
warn "This will overwrite the current database. Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

log "Restoring MongoDB backup..."
docker exec "$CONTAINER_NAME" mongorestore \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    --db="$MONGO_DATABASE" \
    --drop \
    "/tmp/$MONGO_DATABASE" \
    --quiet

if [ $? -ne 0 ]; then
    error "MongoDB restore failed"
    exit 1
fi

log "Restore completed successfully"

# Cleanup
log "Cleaning up..."
rm -rf "$RESTORE_DIR"
docker exec "$CONTAINER_NAME" rm -rf /tmp/"$BACKUP_FILE" "/tmp/$MONGO_DATABASE" 2>/dev/null || true

log "MongoDB restore process completed successfully"

exit 0
