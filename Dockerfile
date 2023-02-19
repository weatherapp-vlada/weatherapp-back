FROM public.ecr.aws/docker/library/node:16-alpine AS base

FROM base AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM base AS production

ARG NODE_ENV=production

EXPOSE 3000

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/ .

CMD [ "node", "dist/src/main" ]
