**Overview**

https://dungeon-diaries.com  
Frontend source: https://github.com/aungpkhant/dungeon-diaries-fe

**Development notes**

Run postgres and redis services for development. Building the backend service can be skipped for development.

```
docker compose -f docker/docker-compose.yml --env-file .env up -d redis postgres
```

Backend service can be started using the following. Backend should connect to postgres and redis if enviroment variables have been set correctly.

```
npm run start
```

**Backend setup**

The backend is set up on AWS with 3 EC2 micro instances for now.

- NGINX
- Production
  - backend
  - redis
  - postgres
- Staging
  - backend service
  - redis
  - postgres

The production and staging servers are almost identical, only running different versions of the code `master` vs `staging` branches. Should be able to easily split Production into separate DB, cache and mutliple workers later on.

---

**Resources**

Setting up SSL, NGINX on docker, etc - https://www.digitalocean.com/community/tutorials/how-to-secure-a-containerized-node-js-application-with-nginx-let-s-encrypt-and-docker-compose

Building nested trees in db for comment chains - https://www.sqlteam.com/articles/more-trees-hierarchies-in-sql

---

**Notes**

```
$ docker-compose build # build changes
$ docker-compose up # start web and backend services
```

Development:
just needs postgres running, start just postgres using (will skip building/running backend service)

```
$ docker-compose run postgres
```

Start services using:

```
$ docker-compose up
```

Connect to psql using:

```
docker exec -it postgres psql -U postgres
```

Run all database migrations

```
knex migrate:latest
```
