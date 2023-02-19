terraform {
  source = "../../modules//vpc"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  main_cidr_block = "10.0.0.0/16"
  private_cidr_blocks = [ "10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24" ]
}
