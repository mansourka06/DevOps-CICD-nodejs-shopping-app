variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_name" {
  type        = string
  description = "EC2 key pair name"
}

variable "allowed_ssh_cidr" {
  type        = string
  description = "CIDR allowed to SSH"
}

variable "public_key_path" {
  type        = string
  description = "Absolute path to SSH public key (.pub)"
}
variable "bastion_instance_type" {
  type    = string
  default = "t3.micro"
}