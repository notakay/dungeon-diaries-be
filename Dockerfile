FROM node
WORKDIR /usr/server

COPY src ./src
COPY knex ./knex
COPY config ./config
COPY knexfile.ts .
COPY tsconfig.json .
COPY package*.json .

run npm install -g npm@8.3.0
RUN npm install -g knex typescript
RUN npm install

CMD knex migrate:latest && npm run dev