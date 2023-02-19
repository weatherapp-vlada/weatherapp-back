module code_build {
  source = "./modules/code_build"

  region                      = var.region
  codebuild_project_name      = var.codebuild_project_name
  github_connection_arn       = var.github_connection_arn
  codepipeline_bucket_arn     = module.code_pipeline.bucket_arn
}

module code_pipeline {
  source = "./modules/code_pipeline"

  name                   = var.codepipeline_name
  github_repo            = var.github_repo
  github_connection_arn  = var.github_connection_arn
  codepipeline_name      = var.codepipeline_name
  codebuild_project_name = module.code_build.project_name
  beanstalk_app_name     = var.beanstalk_app_name
  beanstalk_env_name     = var.beanstalk_env_name
}
