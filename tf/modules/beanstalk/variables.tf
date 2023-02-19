variable "region" {
  type = string
  default = "eu-central-1"
}

variable "application_name" {
  type = string
}

variable vpc_id {
  type = string
}

variable ec2_subnets {
  type = list(string)
}

variable elb_subnets {
  type = list(string)
}

variable "instance_type" {
  type = string
}

variable "disk_size" {
  type = string
}

variable "certificate_arn" {
  type = string
}

variable "route53_zone_id" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "secrets" {
  type = string
}

variable "db_host" {
  type = string
}

variable "db_port" {
  type = string
}

variable "db_name" {
  type = string
}

variable "rds_sg" {
  type = string
}