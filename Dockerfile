FROM public.ecr.aws/docker/library/node:16-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM public.ecr.aws/docker/library/node:16-alpine AS production

ARG NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/ .

CMD [ "node", "dist/main" ]
