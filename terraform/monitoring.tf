# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/doctor-channeling/${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "doctor-channeling-logs"
    Environment = var.environment
  }
}

# CloudWatch Log Streams
resource "aws_cloudwatch_log_stream" "backend_logs" {
  name           = "backend"
  log_group_name = aws_cloudwatch_log_group.app_logs.name
}

resource "aws_cloudwatch_log_stream" "frontend_logs" {
  name           = "frontend"
  log_group_name = aws_cloudwatch_log_group.app_logs.name
}

resource "aws_cloudwatch_log_stream" "mongodb_logs" {
  name           = "mongodb"
  log_group_name = aws_cloudwatch_log_group.app_logs.name
}

resource "aws_cloudwatch_log_stream" "nginx_logs" {
  name           = "nginx"
  log_group_name = aws_cloudwatch_log_group.app_logs.name
}

# CloudWatch Alarms

# High CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "doctor-channeling-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = {
    Name        = "doctor-channeling-high-cpu-alarm"
    Environment = var.environment
  }
}

# High Memory Utilization Alarm (requires CloudWatch agent)
resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "doctor-channeling-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors memory utilization"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = {
    Name        = "doctor-channeling-high-memory-alarm"
    Environment = var.environment
  }
}

# Disk Space Alarm
resource "aws_cloudwatch_metric_alarm" "low_disk_space" {
  alarm_name          = "doctor-channeling-low-disk-space"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "This metric monitors disk utilization"

  dimensions = {
    InstanceId = aws_instance.app.id
    path       = "/"
  }

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = {
    Name        = "doctor-channeling-low-disk-alarm"
    Environment = var.environment
  }
}

# Instance Status Check Alarm
resource "aws_cloudwatch_metric_alarm" "instance_status_check" {
  alarm_name          = "doctor-channeling-instance-status-check"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "0"
  alarm_description   = "This metric monitors instance status checks"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = {
    Name        = "doctor-channeling-status-check-alarm"
    Environment = var.environment
  }
}

# Application Health Check Alarm (custom metric)
resource "aws_cloudwatch_metric_alarm" "app_health_check" {
  alarm_name          = "doctor-channeling-app-health"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthCheckStatus"
  namespace           = "DoctorChanneling"
  period              = "60"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors application health"
  treat_missing_data  = "breaching"

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = {
    Name        = "doctor-channeling-health-alarm"
    Environment = var.environment
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "doctor-channeling-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", { stat = "Average", label = "CPU Usage" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "EC2 CPU Utilization"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["CWAgent", "mem_used_percent", { stat = "Average", label = "Memory Usage" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Memory Utilization"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["CWAgent", "disk_used_percent", { stat = "Average", label = "Disk Usage" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Disk Utilization"
        }
      },
      {
        type = "log"
        properties = {
          query   = "SOURCE '${aws_cloudwatch_log_group.app_logs.name}' | fields @timestamp, @message | sort @timestamp desc | limit 20"
          region  = var.aws_region
          title   = "Recent Application Logs"
        }
      }
    ]
  })
}
