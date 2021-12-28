FROM node
WORKDIR /usr/server

COPY src ./src
COPY knex ./knex
COPY config ./config

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY knexfile.ts .
COPY wait-for-postgres.sh .

RUN npm install -g npm@8.3.0
RUN npm install -g knex typescript
RUN npm install

RUN apt update
RUN apt install -y postgresql-client

CMD ./wait-for-postgres.sh && knex migrate:latest && npm run dev
