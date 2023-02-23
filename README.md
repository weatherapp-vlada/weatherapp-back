# TODO v1

- Setup Project
  - [x] Generate boilerplate NestJS app
  - [x] Dockerize
  - [x] Add swagger
  - [x] Add ORM, setup DB and migrations
  - [x] Configure supported cities
  - [x] Implement health checks
- Implement business logic
  - [x] Implement OpenWeatherMapApi client
  - [x] Add endpoints for fetching weather data
  - [x] Create cronjob to update weather data hourly/daily
  - [x] Grab weather data for next 5 days on startup
- Deploy
  - [x] IaC for AWS infrastructure and CI/CD
- Finishing up v1
  - [x] Structured logging
  - [x] Error handling
  - [x] Format responses (date format, decimal points on numbers etc)
- Refactor
  - [x] Create microservice Transport and Decorators for PgBoss (maybe create npm package `nestjs-pgboss`)
  - [x] Implement CQRS
  - [ ] Add more cities (take into account 1000 req/day and 60 req/sec OpenWeatherMap limits)
  - [ ] Cover project with tests and add them to CI/CD as quality gate
- Metrics and K8s
  - [ ] Deploy to EKS using GitOps (ArgoCD) and IaC
  - [ ] Add metrics using Prometheus
  - [ ] Implement graceful shutdown with shutdown hooks
- User microservice
  - [ ] Add auth (AWS Cognito)
  - [ ] Add feature for users to create their own dashboards with forecasts and notification triggers (AWS SES)
  - [ ] Add Kafka for messaging (deploy inside K8s using Strimzi)
  - [ ] Implement Saga distributed transaction (use-case TBD, maybe will require 3rd microservice)
  - [ ] Add Redis for caching (and replace PgBoss with `@nestjs/bull`?)
  - [ ] Outbox pattern and resilience
- Frontend
  - Implement Frontend in NextJS (D3.js for some graph visualization)
  - Add GraphQL Backend for frontend? Replace REST API on microservices with GraphQL?

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
