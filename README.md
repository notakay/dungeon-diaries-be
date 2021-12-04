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
