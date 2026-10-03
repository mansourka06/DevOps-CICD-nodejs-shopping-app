variable "region" {
  type        = string
  description = "AWS region"
  default     = "us-west-1"
}

variable "bucket_name" {
  type        = string
  description = "S3 bucket name for Terraform state"
}

variable "dynamodb_table_name" {
  type        = string
  description = "DynamoDB table for Terraform locks"
}
