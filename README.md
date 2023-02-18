# TODO

- ~~Generate boilerplate NestJS app~~
- ~~Dockerize~~
- ~~Add swagger~~
- ~~Add ORM, setup DB and migrations~~
- ~~Add config for supported cities~~
- ~~Implement OpenWeatherMapApi client~~
- ~~Add endpoints for fetching weather data~~
- ~~Create cronjob to update weather data hourly/daily~~
- ~~Grab weather data for next 5 days on startup if needed~~
- Format responses (dates, temperatures), error handling and logging
- IaC for CI/CD and deployment to AWS Elastic Beanstalk

# How to start app locally

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
