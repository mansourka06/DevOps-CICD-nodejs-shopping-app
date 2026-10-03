terraform {
  backend "s3" {
    bucket         = "nodejs-shopping-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-west-1"
    dynamodb_table = "nodejs-shopping-terraform-locks"
    encrypt        = true
  }
}
