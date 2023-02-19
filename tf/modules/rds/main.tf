resource "aws_db_subnet_group" "db-subnet-group" {
  name       = "db_subnet_group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.db_identifier}_db_subnet_group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.db_identifier}_db_sg"
  description = "RDS Security Group"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.db_name}_db_sg"
  }
}

data "aws_secretsmanager_secret_version" "db_creds" {
  secret_id = var.db_secrets
}

locals {
  db_secrets = jsondecode(
    data.aws_secretsmanager_secret_version.db_creds.secret_string
  )
}

resource "aws_db_instance" "rds" {
  identifier             = var.db_identifier
  db_subnet_group_name   = aws_db_subnet_group.db-subnet-group.id
  allocated_storage      = var.allocated_storage
  engine                 = var.engine
  engine_version         = var.engine_version
  instance_class         = var.instance_class
  multi_az               = var.multi_az
  db_name                = var.db_name
  username               = local.db_secrets.db_username
  password               = local.db_secrets.db_password
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
}
