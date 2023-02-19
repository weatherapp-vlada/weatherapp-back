data "aws_caller_identity" "default" {}

data "aws_iam_policy_document" "cb_assume_role_policy_doc" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["codebuild.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "cb_use_connection_policy_doc" {
  statement {
    actions = ["codestar-connections:UseConnection"]
    resources = [var.github_connection_arn]
  }
}

data "aws_iam_policy_document" "cb_policy_doc" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
      ]
    resources = [
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.default.account_id}:log-group:${var.codebuild_project_name}-group",
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.default.account_id}:log-group:${var.codebuild_project_name}-group:*"
      ]
  }

  statement {
    actions = [
      "s3:*"
      ]
    resources = [
      var.codepipeline_bucket_arn,
      "${var.codepipeline_bucket_arn}/*"
    ]
  }

  statement {
    actions = [
      "codebuild:CreateReportGroup",
      "codebuild:CreateReport",
      "codebuild:UpdateReport",
      "codebuild:BatchPutTestCases",
      "codebuild:BatchPutCodeCoverages"
      ]
    resources = ["arn:aws:codebuild:${var.region}:${data.aws_caller_identity.default.account_id}:report-group/${var.codebuild_project_name}-*"]
  }
}
