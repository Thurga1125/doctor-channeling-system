provider "aws" {
  region = "ap-south-1"
}

resource "aws_instance" "app" {
  ami           = "ami-0dee22c13ea7a9a67"  # Ubuntu 24.04 LTS (verified)
  instance_type = "t2.micro"               # Free tier eligible
  key_name      = "doctor-channeling-key"  # Replace with YOUR key name
  
  tags = {
    Name = "Doctor-Channeling-Server"
  }
}

output "public_ip" {
  value = aws_instance.app.public_ip
}
