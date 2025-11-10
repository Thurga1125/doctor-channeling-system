pipeline {
    agent any
    
    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
                git branch: 'main', url: 'https://github.com/Thurga1125/doctor-channeling-system.git'
            }
        }
        
        stage('Validate Terraform') {
            steps {
                echo 'Validating Terraform configuration...'
                dir('terraform') {
                    sh 'terraform init'
                    sh 'terraform validate'
                }
            }
        }
        
        stage('Validate Ansible') {
            steps {
                echo 'Checking Ansible playbook syntax...'
                dir('ansible') {
                    sh 'ansible-playbook -i inventory.ini playbook.yml --syntax-check'
                }
            }
        }
        
        stage('Success') {
            steps {
                echo '✅ All validations passed!'
            }
        }
    }
}
