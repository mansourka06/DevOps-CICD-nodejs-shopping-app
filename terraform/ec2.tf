data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = aws_key_pair.app.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  tags = {
    Name = "nodejs-mongo-app"
  }
}

resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.bastion_instance_type
  subnet_id                   = aws_subnet.public_a.id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  key_name                    = aws_key_pair.app.key_name

  tags = {
    Name = "nodejs-shopping-bastion"
  }
}
