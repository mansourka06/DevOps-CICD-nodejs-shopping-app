module "alb" {
  source = "./modules/alb"

  vpc_id            = aws_vpc.main.id
  public_subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  app_instance_id   = aws_instance.app.id
}
