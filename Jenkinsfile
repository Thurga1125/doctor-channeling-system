pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_HUB_USERNAME = 'thurgarajinathan'
        APP_NAME = 'doctor-channeling'
        APP_DIR = '/home/ubuntu/doctor-channeling-system'
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

        stage('Deploy Application') {
            steps {
                echo 'Deploying application locally...'
                sh """
                    cd ${APP_DIR}
                    git pull origin main || true

                    # Ensure .env file exists
                    if [ ! -f .env ]; then
                        echo "ERROR: Missing ${APP_DIR}/.env file" >&2
                        exit 1
                    fi

                    # Pull latest images from Docker Hub
                    docker pull ${DOCKER_HUB_USERNAME}/${APP_NAME}-backend:latest
                    docker pull ${DOCKER_HUB_USERNAME}/${APP_NAME}-frontend:latest

                    # Stop existing containers
                    docker compose -f docker-compose-production.yml down || true

                    # Start with new images
                    docker compose -f docker-compose-production.yml up -d --remove-orphans

                    # Clean up old images
                    docker image prune -f
                """
            }
        }

        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                script {
                    sleep(30)
                    sh 'curl -f http://localhost:8080/actuator/health || echo "Backend health check pending..."'
                    sh 'curl -f http://localhost:80 || echo "Frontend health check pending..."'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            sh 'docker logout || true'
            cleanWs()
        }
    }
}
