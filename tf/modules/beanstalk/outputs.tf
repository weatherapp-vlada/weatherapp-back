output "env_name" {
  value = aws_elastic_beanstalk_environment.beanstalkappenv.name
}

output "app_name" {
  value = aws_elastic_beanstalk_application.elasticapp.name
}

output "asg_name" {
  value = aws_elastic_beanstalk_environment.beanstalkappenv.autoscaling_groups[0]
}

output "lb_arn" {
  value = aws_elastic_beanstalk_environment.beanstalkappenv.load_balancers[0]
}