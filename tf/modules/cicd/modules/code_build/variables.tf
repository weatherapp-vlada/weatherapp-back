variable "region" {
  type = string
  default = "eu-central-1"
}

variable "codebuild_project_name" {
  type = string
}

variable "github_connection_arn" {
  type = string
}

variable "codepipeline_bucket_arn" {
  type = string
}