variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for ALB"
  type        = list(string)
}

variable "app_instance_id" {
  description = "Application EC2 instance ID"
  type        = string
}
