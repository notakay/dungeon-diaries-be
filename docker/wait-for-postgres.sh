#!/bin/sh
# wait-for-postgres.sh

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "postgres" -c '\q'; do
  >&2 echo "Cannot connect to DB. Retrying..."
  sleep 5
done
  
>&2 echo "Connected to DB!"
exec "$@"