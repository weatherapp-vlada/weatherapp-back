data "aws_iam_policy_document" "cp_policy_doc" {
  statement {
    actions = ["codestar-connections:UseConnection"]
    resources = [var.github_connection_arn]
  }

  statement {
    actions = [
      "cloudwatch:*",
      "s3:*",
      "elasticbeanstalk:*",
      "cloudformation:*",
      "ec2:*",
      "autoscaling:*",
      "logs:*",
      "elasticloadbalancing:*"
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "codebuild:BatchGetBuilds",
      "codebuild:StartBuild",
      "codebuild:BatchGetBuildBatches",
      "codebuild:StartBuildBatch"
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "cp_assume_role_policy_doc" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["codepipeline.amazonaws.com"]
    }
  }
}
