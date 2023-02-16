# TODO

- ~~Generate boilerplate NestJS app~~
- ~~Dockerize~~
- ~~Add swagger~~
- ~~Add ORM, setup DB and migrations~~
- ~~Add config for supported cities~~
- Add endpoints for fetching weather data
- Grab weather data for next 5 days on startup
- Create cronjob to update weather data hourly/daily
- IaC for CI/CD and deployment to AWS Elastic Beanstalk

# How to start app locally

1. Install Docker
2. In shell of your choice go into `docker` folder
3. Run `docker-compose up` command
4. Stop app with `docker-compose down`

App is running at `localhost:3000`. Swagger is at `localhost:3000/swagger`.
