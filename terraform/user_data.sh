#!/bin/bash
set -e

exec > >(tee /var/log/user-data.log) 2>&1
echo "=== User data script started at $(date) ==="

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
    unzip \
    fontconfig

# ========================================
# Install Docker
# ========================================
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Install Docker Compose standalone
DOCKER_COMPOSE_VERSION="2.24.0"
curl -L "https://github.com/docker/compose/releases/download/v$${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# ========================================
# Install Java 17 (required for Jenkins and Maven)
# ========================================
apt-get install -y openjdk-17-jdk
echo "JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> /etc/environment

# ========================================
# Install Node.js 18 (required for Frontend builds)
# ========================================
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# ========================================
# Install Jenkins
# ========================================
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
apt-get update -y
apt-get install -y jenkins

# Configure Jenkins to run on port 8082 (8080 is used by the backend)
mkdir -p /etc/systemd/system/jenkins.service.d
cat > /etc/systemd/system/jenkins.service.d/override.conf <<'JENKINSCONF'
[Service]
Environment="JENKINS_PORT=8082"
JENKINSCONF

# Add jenkins user to docker group so Jenkins can run Docker commands
usermod -aG docker jenkins

systemctl daemon-reload
systemctl start jenkins
systemctl enable jenkins

# ========================================
# Install AWS CLI v2
# ========================================
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws

# ========================================
# Install CloudWatch Agent
# ========================================
wget -q https://s3.${aws_region}.amazonaws.com/amazoncloudwatch-agent-${aws_region}/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb -O /tmp/amazon-cloudwatch-agent.deb
dpkg -i -E /tmp/amazon-cloudwatch-agent.deb
rm /tmp/amazon-cloudwatch-agent.deb

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
          },
          {
            "file_path": "/var/log/jenkins/jenkins.log",
            "log_group_name": "${log_group_name}",
            "log_stream_name": "{instance_id}/jenkins"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_iowait"],
        "metrics_collection_interval": 60,
        "totalcpu": false
      },
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": ["swap_used_percent"],
        "metrics_collection_interval": 60
      }
    }
  }
}
CWCONFIG

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# ========================================
# Prepare application directory
# ========================================
mkdir -p /home/ubuntu/doctor-channeling-system/logs
chown -R ubuntu:ubuntu /home/ubuntu/doctor-channeling-system

# ========================================
# MongoDB backup script
# ========================================
cat > /usr/local/bin/backup-mongodb.sh <<'BACKUPSCRIPT'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mongodb_backup_$DATE.gz"
BACKUP_DIR="/tmp/mongodb-backups"
AWS_REGION="${aws_region}"
S3_BUCKET="${backup_bucket_name}"
SECRET_ARN="${mongodb_secret_arn}"

mkdir -p $BACKUP_DIR

MONGO_SECRET=$(aws secretsmanager get-secret-value --secret-id $SECRET_ARN --region $AWS_REGION --query SecretString --output text)
MONGO_USERNAME=$(echo $MONGO_SECRET | jq -r '.username')
MONGO_PASSWORD=$(echo $MONGO_SECRET | jq -r '.password')
MONGO_DATABASE=$(echo $MONGO_SECRET | jq -r '.database')

docker exec mongodb mongodump \
    --username=$MONGO_USERNAME \
    --password=$MONGO_PASSWORD \
    --authenticationDatabase=admin \
    --db=$MONGO_DATABASE \
    --out=/tmp/backup

docker exec mongodb tar -czf /tmp/$BACKUP_NAME -C /tmp/backup .
docker cp mongodb:/tmp/$BACKUP_NAME $BACKUP_DIR/
aws s3 cp $BACKUP_DIR/$BACKUP_NAME s3://$S3_BUCKET/backups/ --region $AWS_REGION

rm -rf $BACKUP_DIR
docker exec mongodb rm -rf /tmp/backup /tmp/$BACKUP_NAME

echo "Backup completed: $BACKUP_NAME"
aws cloudwatch put-metric-data \
    --namespace DoctorChanneling \
    --metric-name BackupStatus \
    --value 1 \
    --region $AWS_REGION
BACKUPSCRIPT

chmod +x /usr/local/bin/backup-mongodb.sh

# ========================================
# Health check script
# ========================================
cat > /usr/local/bin/health-check.sh <<'HEALTHSCRIPT'
#!/bin/bash
AWS_REGION="${aws_region}"

BACKEND_STATUS=$(curl -s -o /dev/null -w "%%{http_code}" http://localhost:8080/actuator/health || echo "0")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%%{http_code}" http://localhost:80 || echo "0")

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    HEALTH_VALUE=1
else
    HEALTH_VALUE=0
fi

aws cloudwatch put-metric-data \
    --namespace DoctorChanneling \
    --metric-name HealthCheckStatus \
    --value $HEALTH_VALUE \
    --region $AWS_REGION
HEALTHSCRIPT

chmod +x /usr/local/bin/health-check.sh

# ========================================
# Setup cron jobs (both in a single crontab to avoid overwrite)
# ========================================
cat > /tmp/crontab-ubuntu <<'CRONTAB'
# Daily MongoDB backup at 2 AM
0 2 * * * /usr/local/bin/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
# Health check every 5 minutes
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1
CRONTAB
crontab -u ubuntu /tmp/crontab-ubuntu
rm /tmp/crontab-ubuntu

# ========================================
# Configure UFW firewall
# ========================================
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp
ufw allow 8082/tcp

echo "=== User data script completed at $(date) ==="
