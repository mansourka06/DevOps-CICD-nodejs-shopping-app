############################################
# IAM Role for EC2 (Least Privilege)
############################################

resource "aws_iam_role" "ec2_app_role" {
  name = "nodejs-shopping-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

############################################
# IAM Policy (CloudWatch Logs + ECR read)
############################################

resource "aws_iam_policy" "ec2_app_policy" {
  name = "nodejs-shopping-ec2-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [

      # CloudWatch Logs
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },

      # ECR read-only (future-proof)
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = "*"
      }
    ]
  })
}

############################################
# Attach policy to role
############################################

resource "aws_iam_role_policy_attachment" "ec2_attach" {
  role       = aws_iam_role.ec2_app_role.name
  policy_arn = aws_iam_policy.ec2_app_policy.arn
}

############################################
# Instance Profile (required for EC2)
############################################

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "nodejs-shopping-ec2-profile"
  role = aws_iam_role.ec2_app_role.name
}
