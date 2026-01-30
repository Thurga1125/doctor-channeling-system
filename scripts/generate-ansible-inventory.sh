#!/bin/bash
# Script to generate Ansible inventory from Terraform outputs

set -e

TERRAFORM_DIR="../terraform"
ANSIBLE_DIR="../ansible"
INVENTORY_FILE="$ANSIBLE_DIR/inventory.ini"

echo "Generating Ansible inventory from Terraform outputs..."

# Change to terraform directory
cd "$(dirname "$0")/$TERRAFORM_DIR"

# Get Terraform outputs
PUBLIC_IP=$(terraform output -raw public_ip 2>/dev/null)

if [ -z "$PUBLIC_IP" ]; then
    echo "Error: Could not retrieve public IP from Terraform outputs"
    echo "Make sure you have run 'terraform apply' successfully"
    exit 1
fi

# Generate inventory file
cat > "../ansible/inventory.ini" <<EOF
[web]
$PUBLIC_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/doctor-channeling-key.pem

[web:vars]
ansible_python_interpreter=/usr/bin/python3
EOF

echo "Ansible inventory generated successfully at: $INVENTORY_FILE"
echo "EC2 Instance IP: $PUBLIC_IP"
echo ""
echo "You can now run:"
echo "  cd ansible && ansible-playbook -i inventory.ini playbook.yml"
