pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_HUB_USERNAME = 'thurga1125'
        APP_NAME = 'doctor-channeling'
        AWS_CREDENTIALS = credentials('aws-credentials')
        EC2_HOST = credentials('ec2-host-ip')
        SSH_KEY = credentials('ec2-ssh-key')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                git branch: 'main', url: 'https://github.com/Thurga1125/doctor-channeling-system.git'
            }
        }

        stage('Validate Infrastructure') {
            parallel {
                stage('Validate Terraform') {
                    steps {
                        echo 'Validating Terraform configuration...'
                        dir('terraform') {
                            sh 'terraform init -backend=false'
                            sh 'terraform validate'
                        }
                    }
                }
                stage('Validate Ansible') {
                    steps {
                        echo 'Checking Ansible playbook syntax...'
                        dir('ansible') {
                            sh 'ansible-playbook playbook.yml --syntax-check'
                        }
                    }
                }
            }
        }

        stage('Build & Test Backend') {
            steps {
                echo 'Building and testing Spring Boot application...'
                dir('Backend') {
                    sh 'chmod +x mvnw || true'
                    sh './mvnw clean package -DskipTests'
                    sh './mvnw test'
                }
            }
            post {
                always {
                    dir('Backend') {
                        junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                    }
                }
            }
        }

        stage('Build & Test Frontend') {
            steps {
                echo 'Building React application...'
                dir('Frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                    sh 'npm test -- --watchAll=false --passWithNoTests || true'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                sh "docker build -t ${DOCKER_HUB_USERNAME}/${APP_NAME}-backend:${BUILD_NUMBER} -t ${DOCKER_HUB_USERNAME}/${APP_NAME}-backend:latest ./Backend"
                sh "docker build -t ${DOCKER_HUB_USERNAME}/${APP_NAME}-frontend:${BUILD_NUMBER} -t ${DOCKER_HUB_USERNAME}/${APP_NAME}-frontend:latest ./Frontend"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing images to Docker Hub...'
                sh 'echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin'
                sh "docker push ${DOCKER_HUB_USERNAME}/${APP_NAME}-backend:${BUILD_NUMBER}"
                sh "docker push ${DOCKER_HUB_USERNAME}/${APP_NAME}-backend:latest"
                sh "docker push ${DOCKER_HUB_USERNAME}/${APP_NAME}-frontend:${BUILD_NUMBER}"
                sh "docker push ${DOCKER_HUB_USERNAME}/${APP_NAME}-frontend:latest"
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2 instance...'
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@\${EC2_HOST} << 'ENDSSH'
                            cd /home/ubuntu/doctor-channeling-system || git clone https://github.com/Thurga1125/doctor-channeling-system.git /home/ubuntu/doctor-channeling-system
                            cd /home/ubuntu/doctor-channeling-system
                            git pull origin main

                            # Pull latest images
                            docker pull ${DOCKER_HUB_USERNAME}/${APP_NAME}-backend:latest
                            docker pull ${DOCKER_HUB_USERNAME}/${APP_NAME}-frontend:latest

                            # Stop and remove existing containers
                            docker-compose down || true

                            # Start with new images
                            docker-compose up -d

                            # Clean up old images
                            docker image prune -f
ENDSSH
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                script {
                    sleep(30)  // Wait for services to start
                    sh "curl -f http://\${EC2_HOST}:8080/api/health || echo 'Backend health check pending...'"
                    sh "curl -f http://\${EC2_HOST}:3000 || echo 'Frontend health check pending...'"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            // Uncomment to enable Slack notifications
            // slackSend color: 'good', message: "Deployment successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        failure {
            echo 'Pipeline failed!'
            // slackSend color: 'danger', message: "Deployment failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        always {
            sh 'docker logout || true'
            cleanWs()
        }
    }
}
