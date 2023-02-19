# TODO

- Setup Project
  - ~~Generate boilerplate NestJS app~~
  - ~~Dockerize~~
  - ~~Add swagger~~
  - ~~Add ORM, setup DB and migrations~~
  - ~~Configure supported cities~~
  - ~~Implement health checks~~
- Implement business logic
  - ~~Implement OpenWeatherMapApi client~~
  - ~~Add endpoints for fetching weather data~~
  - ~~Create cronjob to update weather data hourly/daily~~
  - ~~Grab weather data for next 5 days on startup~~
- Deploy
  - ~~IaC for AWS infrastructure and CI/CD~~
- Touching up
  - ~~Structured logging~~
  - ~~Error handling~~
  - ~~Format responses (date format, decimal points on numbers etc)~~

# Starting app locally

1. Install Docker and docker-compose
2. Create `./docker/.env` file according to `./docker/.env.example` (use your own OpenWeatherMap API key)
3. In shell go into `docker` folder
4. Run `docker-compose up` command
5. Stop app with `docker-compose down`

App is running at `localhost:3000`. Swagger is at `localhost:3000/swagger`.

# Generating migrations

```
docker-compose up
npm run migration:host:generate -- --name=migration_name
```

# Live environment

Application is deployed (using terraform code in `tf` folder) at https://weather.inviggde.com/swagger

# Deploying to your AWS account

1. Host this git repository on Github
2. Create Github connection on your AWS account with permission to read Github repository from step 1 ([link](https://console.aws.amazon.com/codesuite/settings/connections))
3. Create Route53 hosted zone
4. On OpenWeatherMapApi create API key ([link](https://home.openweathermap.org/api_keys))
5. In AWS Secrets Manager create secret:

```
{
  "db_username": "some username",
  "db_password": "some password",
  "openweathermap_apikey": "apikey"
}
```

5. Install `terraform`, `terragrunt` and `aws` cli tool
6. Configure `aws` tool
7. In `./tf` folder check all `*.hcl` files and update inputs if needed (like `github_connection_arn`, `github_repo`, `domain_name`, `zone_name`, name of your secret created in step 4 etc)
8. In `./tf/live` folder run `terragrunt run-all apply`

To destroy all AWS resources run `terragrunt run-all destroy`
