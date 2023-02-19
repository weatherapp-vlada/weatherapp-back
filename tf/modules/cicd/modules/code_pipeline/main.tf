data "aws_caller_identity" "default" {}

resource "aws_s3_bucket" "codepipeline_bucket" {
  bucket = "${var.name}"
  force_destroy = true
}

resource "aws_s3_bucket_acl" "codepipeline_bucket_acl" {
  bucket       = aws_s3_bucket.codepipeline_bucket.id
  acl          = "private"
}

resource "aws_s3_bucket_public_access_block" "codepipeline_bucket_public_access_block" {
  bucket = aws_s3_bucket.codepipeline_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_codepipeline" "codepipeline" {
  name     = "${var.name}"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.codepipeline_bucket.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]
      configuration = {
        ConnectionArn    = var.github_connection_arn
        FullRepositoryId = var.github_repo
        BranchName       = "main"
      }
    }
  }

  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"

      configuration = {
        ProjectName = var.codebuild_project_name
      }
    }
  }
  
  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ElasticBeanstalk"
      input_artifacts = ["build_output"]
      version         = "1"

      configuration = {
        ApplicationName = var.beanstalk_app_name
        EnvironmentName = var.beanstalk_env_name
      }
    }

  }
}

resource "aws_iam_role" "codepipeline_role" {
  name = "${var.codepipeline_name}-role"
  assume_role_policy = data.aws_iam_policy_document.cp_assume_role_policy_doc.json
  managed_policy_arns = [aws_iam_policy.cp_policy.arn]
  force_detach_policies = true
}

resource "aws_iam_policy" "cp_policy" {
  name   = "${var.codepipeline_name}-policy"
  policy = data.aws_iam_policy_document.cp_policy_doc.json
}
