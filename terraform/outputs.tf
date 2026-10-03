
output "app_private_ip" {
  description = "Private IP address of application EC2"
  value       = aws_instance.app.private_ip
}

output "bastion_public_ip" {
  description = "Public IP address of bastion host"
  value       = aws_instance.bastion.public_ip
}

output "alb_dns_name" {
  value       = module.alb.alb_dns_name
  description = "Public DNS name of the Application Load Balancer"
}