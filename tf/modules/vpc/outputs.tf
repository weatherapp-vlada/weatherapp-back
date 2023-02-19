output "vpc_id" {
  value       = aws_vpc.main.id
  description = "Main VPC ID"
}

output "private_subnet_ids" {
  value       = aws_subnet.private_subnets.*.id
  description = "Private subnet IDs"
}

output "public_subnet_ids" {
  value       = aws_subnet.public_subnets.*.id
  description = "Public subnet IDs"
}