data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block = var.main_cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_subnet" "private_subnets" {
  count                   = min(length(var.private_cidr_blocks), length(data.aws_availability_zones.available))
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.private_cidr_blocks[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "private_subnet_${data.aws_availability_zones.available.names[count.index]}"
  }
}

resource "aws_subnet" "public_subnets" {
  count                   = min(length(var.public_cidr_blocks), length(data.aws_availability_zones.available))
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_cidr_blocks[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "public_subnet_${data.aws_availability_zones.available.names[count.index]}"
  }
}

resource "aws_internet_gateway" "vpc_igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.vpc_igw.id
  }
}

resource "aws_route_table_association" "vpc_public_route_table_association" {
  count = length(aws_subnet.public_subnets)
  subnet_id = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_eip" "vpc_nat_gateway" {
  vpc = true
}

resource "aws_nat_gateway" "vpc_nat_gateway" {
  allocation_id = aws_eip.vpc_nat_gateway.id
  subnet_id = aws_subnet.public_subnets[0].id
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.vpc_nat_gateway.id
  }
}

resource "aws_route_table_association" "vpc_private_route_table_association" {
  count = length(aws_subnet.private_subnets)
  subnet_id = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_route_table.id
}
