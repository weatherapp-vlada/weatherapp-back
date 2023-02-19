terraform {
  source = "../../modules//rds"
}

include {
  path = find_in_parent_folders()
}

dependency "vpc" {
  config_path = "../vpc"
}

inputs = {
  db_identifier = "weatherapp-db"
  db_name = "weather"
  db_secrets = "weatherapp-secrets"
  vpc_id = dependency.vpc.outputs.vpc_id
  subnet_ids = dependency.vpc.outputs.private_subnet_ids
}