**TODOS**

- Better documentation

---

Building nested trees in db for comment chains:
https://www.sqlteam.com/articles/more-trees-hierarchies-in-sql

---

Production: will run migrations, etc etc

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
