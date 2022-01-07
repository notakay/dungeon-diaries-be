FROM node

RUN apt update
RUN apt install -y postgresql-client

# TODO: Improve this later, maybe save as dev dependencies?
RUN npm install -g npm@8.3.0
RUN npm install -g knex typescript

COPY package.json /tmp/package.json
COPY package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/server && cp -a /tmp/node_modules /opt/server/

WORKDIR /opt/server

COPY src ./src
COPY knex ./knex
COPY config ./config

COPY tsconfig.json .
COPY knexfile.ts .
COPY wait-for-postgres.sh .

CMD ./wait-for-postgres.sh && knex migrate:latest && npm run build && npm run start
