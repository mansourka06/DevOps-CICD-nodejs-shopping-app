#!/usr/bin/env bash
set -euo pipefail

TF_DIR="terraform"
ANSIBLE_DIR="ansible"

echo "Reading Terraform output..."
EC2_IP=$(terraform -chdir=$TF_DIR output -raw ec2_public_ip)

echo "Generating Ansible inventory..."
cat > $ANSIBLE_DIR/inventory.ini <<EOF
[app]
server ansible_host=${EC2_IP} ansible_user=ubuntu
EOF

echo "Inventory generated:"
cat $ANSIBLE_DIR/inventory.ini
