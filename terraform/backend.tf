# Remote State Backend Configuration
# This must be created BEFORE running terraform init
# Run the setup script: scripts/setup-terraform-backend.sh

terraform {
  backend "s3" {
    bucket         = "doctor-channeling-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    dynamodb_table = "doctor-channeling-terraform-locks"

    # Enable versioning for state file history
    # versioning = true
  }

  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
