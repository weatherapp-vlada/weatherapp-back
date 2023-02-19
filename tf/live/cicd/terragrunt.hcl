terraform {
  source = "../../modules//cicd"
}

include {
  path = find_in_parent_folders()
}

dependency "beanstalk" {
  config_path = "../beanstalk"
}

inputs = {
  codepipeline_name = "weatherapp-pipeline"
  codebuild_project_name = "weatherapp-codebuild"
  github_repo = "vladadaba/weatherapp",
  github_connection_arn = "arn:aws:codestar-connections:eu-central-1:692885578773:connection/54f7e62f-88e5-49a4-9d50-943b53b406c4"
  beanstalk_app_name = dependency.beanstalk.outputs.app_name
  beanstalk_env_name = dependency.beanstalk.outputs.env_name
}