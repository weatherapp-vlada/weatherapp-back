output "sg" {
  value = aws_security_group.rds_sg.id
}

output "address" {
  value = aws_db_instance.rds.address
}

output "port" {
  value = aws_db_instance.rds.port
}

output "db_name" {
  value = aws_db_instance.rds.db_name
}
