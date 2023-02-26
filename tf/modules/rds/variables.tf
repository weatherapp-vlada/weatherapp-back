variable "region" {
  type = string
  default = "eu-central-1"
}

variable "db_identifier" {
  type = string
}

variable "db_secrets" {
  type        = string
}

variable "db_name" {
  type        = string
}

variable "allocated_storage" {
  type        = number
  default     = 20
}

variable "engine" {
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  type        = string
  default     = "13.7"
}

variable "instance_class" {
  type        = string
  default     = "db.t3.micro"
}

variable "multi_az" {
  type        = bool
  default     = false
}

variable "vpc_id" {
  type        = string
}

variable "subnet_ids" {
  type        = list(string)
}
