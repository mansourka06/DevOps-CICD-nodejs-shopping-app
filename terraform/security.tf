############################
# SSH key pair
############################
resource "aws_key_pair" "app" {
  key_name   = var.key_name
  public_key = file(var.public_key_path)
}

############################
# Bastion Security Group
############################
resource "aws_security_group" "bastion" {
  name        = "nodejs-shopping-bastion-sg"
  description = "Bastion host security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from my IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nodejs-shopping-bastion-sg"
  }
}

############################
# Application Security Group
############################
resource "aws_security_group" "app" {
  name        = "nodejs-app-sg"
  description = "Application EC2 security group"
  vpc_id      = aws_vpc.main.id

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nodejs-app-sg"
  }
}

############################
# HTTP from ALB → App
############################
resource "aws_security_group_rule" "app_http_from_alb" {
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  security_group_id        = aws_security_group.app.id
  source_security_group_id = module.alb.alb_security_group_id
  description              = "HTTP access from ALB only"
}

############################
# SSH from Bastion → App
############################
resource "aws_security_group_rule" "app_ssh_from_bastion" {
  type                     = "ingress"
  from_port                = 22
  to_port                  = 22
  protocol                 = "tcp"
  security_group_id        = aws_security_group.app.id
  source_security_group_id = aws_security_group.bastion.id
  description              = "SSH access from bastion only"
}
