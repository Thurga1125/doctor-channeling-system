#!/bin/bash
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install dependencies
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    jq \
    awscli \
    python3-pip \
    unzip

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Install Docker Compose
DOCKER_COMPOSE_VERSION="2.24.0"
curl -L "https://github.com/docker/compose/releases/download/v$${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install CloudWatch Agent
wget https://s3.${aws_region}.amazonaws.com/amazoncloudwatch-agent-${aws_region}/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# Configure CloudWatch Agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<'CWCONFIG'
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "${log_group_name}",
            "log_stream_name": "{instance_id}/syslog"
          },
          {
            "file_path": "/home/ubuntu/doctor-channeling-system/logs/backend.log",
            "log_group_name": "${log_group_name}",
            "log_stream_name": "{instance_id}/backend"
          },
          {
            "file_path": "/home/ubuntu/doctor-channeling-system/logs/nginx.log",
            "log_group_name": "${log_group_name}",
            "log_stream_name": "{instance_id}/nginx"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          {
            "name": "cpu_usage_idle",
            "rename": "CPU_IDLE",
            "unit": "Percent"
          },
          "cpu_usage_iowait"
        ],
        "metrics_collection_interval": 60,
        "totalcpu": false
      },
      "disk": {
        "measurement": [
          {
            "name": "used_percent",
            "rename": "disk_used_percent",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time"
        ],
        "metrics_collection_interval": 60
      },
      "mem": {
        "measurement": [
          {
            "name": "mem_used_percent",
            "rename": "mem_used_percent",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          {
            "name": "swap_used_percent",
            "rename": "swap_used_percent",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
CWCONFIG

# Start CloudWatch Agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# Create log directory
mkdir -p /home/ubuntu/doctor-channeling-system/logs
chown -R ubuntu:ubuntu /home/ubuntu/doctor-channeling-system

# Create MongoDB backup script
cat > /usr/local/bin/backup-mongodb.sh <<'BACKUPSCRIPT'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mongodb_backup_$DATE.gz"
BACKUP_DIR="/tmp/mongodb-backups"
AWS_REGION="${aws_region}"
S3_BUCKET="${backup_bucket_name}"
SECRET_ARN="${mongodb_secret_arn}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Get MongoDB credentials from Secrets Manager
MONGO_SECRET=$(aws secretsmanager get-secret-value --secret-id $SECRET_ARN --region $AWS_REGION --query SecretString --output text)
MONGO_USERNAME=$(echo $MONGO_SECRET | jq -r '.username')
MONGO_PASSWORD=$(echo $MONGO_SECRET | jq -r '.password')
MONGO_DATABASE=$(echo $MONGO_SECRET | jq -r '.database')

# Backup MongoDB
docker exec mongodb mongodump \
    --username=$MONGO_USERNAME \
    --password=$MONGO_PASSWORD \
    --authenticationDatabase=admin \
    --db=$MONGO_DATABASE \
    --out=/tmp/backup

# Create archive
docker exec mongodb tar -czf /tmp/$BACKUP_NAME -C /tmp/backup .

# Copy from container
docker cp mongodb:/tmp/$BACKUP_NAME $BACKUP_DIR/

# Upload to S3
aws s3 cp $BACKUP_DIR/$BACKUP_NAME s3://$S3_BUCKET/backups/ --region $AWS_REGION

# Cleanup
rm -rf $BACKUP_DIR
docker exec mongodb rm -rf /tmp/backup /tmp/$BACKUP_NAME

echo "Backup completed: $BACKUP_NAME"

# Send custom metric to CloudWatch
aws cloudwatch put-metric-data \
    --namespace DoctorChanneling \
    --metric-name BackupStatus \
    --value 1 \
    --region $AWS_REGION
BACKUPSCRIPT

chmod +x /usr/local/bin/backup-mongodb.sh

# Setup cron job for daily backups at 2 AM
echo "0 2 * * * /usr/local/bin/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1" | crontab -u ubuntu -

# Create health check script
cat > /usr/local/bin/health-check.sh <<'HEALTHSCRIPT'
#!/bin/bash
AWS_REGION="${aws_region}"

# Check backend health
BACKEND_STATUS=$(curl -s -o /dev/null -w "%%{http_code}" http://localhost:8080/actuator/health || echo "0")

# Check frontend health
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%%{http_code}" http://localhost:3000 || echo "0")

# Determine overall health
if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    HEALTH_VALUE=1
else
    HEALTH_VALUE=0
fi

# Send custom metric to CloudWatch
aws cloudwatch put-metric-data \
    --namespace DoctorChanneling \
    --metric-name HealthCheckStatus \
    --value $HEALTH_VALUE \
    --region $AWS_REGION
HEALTHSCRIPT

chmod +x /usr/local/bin/health-check.sh

# Setup cron job for health checks every minute
echo "* * * * * /usr/local/bin/health-check.sh" | crontab -u ubuntu -

# Configure UFW firewall
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 8080/tcp

echo "User data script completed successfully"
