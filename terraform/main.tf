provider "aws" {
  region = "ap-south-1"
}
resource "aws_instance" "app" {
  ami           = "ami-xxxxxxxx"  # change to a real Ubuntu AMI!
  instance_type = "t2.micro"
  key_name      = "YOUR_KEYPAIR"  # must be created in AWS
}
output "public_ip" {
  value = aws_instance.app.public_ip
}
