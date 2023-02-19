variable "region" {
  type = string
  default = "eu-central-1"
}

variable "main_cidr_block" {
  description = "Main VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_cidr_blocks" {
  description = "CIDRs for private subnets"
  type        = list(string)
  default     = [ "10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24" ]
}

variable "public_cidr_blocks" {
  description = "CIDRs for private subnets"
  type        = list(string)
  default     = [ "10.0.3.0/24", "10.0.4.0/24", "10.0.5.0/24" ]
}
