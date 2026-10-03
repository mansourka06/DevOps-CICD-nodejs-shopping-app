# FILE: terraform/cloudwatch.tf
# CloudWatch log groups with retention policy

resource "aws_cloudwatch_log_group" "app" {
  name              = "/nodejs-shopping/app"
  retention_in_days = 3
}

resource "aws_cloudwatch_log_group" "mongo" {
  name              = "/nodejs-shopping/mongo"
  retention_in_days = 3
}
