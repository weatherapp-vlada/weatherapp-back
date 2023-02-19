resource "aws_codebuild_project" "main" {
  name          = var.codebuild_project_name
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:6.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "${var.codebuild_project_name}-group"
      stream_name = "${var.codebuild_project_name}-stream"
    }
  }

  source {
    type = "CODEPIPELINE"
  }
}

resource "aws_iam_role" "codebuild_role" {
  name = "${var.codebuild_project_name}-role"
  assume_role_policy = data.aws_iam_policy_document.cb_assume_role_policy_doc.json
  force_detach_policies = true
}

resource "aws_iam_role_policy_attachment" "cb_policy_attachment" {
  role = aws_iam_role.codebuild_role.name
  policy_arn = aws_iam_policy.cb_policy.arn
}

resource "aws_iam_role_policy_attachment" "cb_use_connection_policy_attachment" {
  role = aws_iam_role.codebuild_role.name
  policy_arn = aws_iam_policy.cb_use_connection_policy.arn
}

resource "aws_iam_policy" "cb_policy" {
  name   = "${var.codebuild_project_name}-policy"
  policy = data.aws_iam_policy_document.cb_policy_doc.json
}

resource "aws_iam_policy" "cb_use_connection_policy" {
  name   = "${var.codebuild_project_name}-use-github-connection-policy"
  policy = data.aws_iam_policy_document.cb_use_connection_policy_doc.json
}
