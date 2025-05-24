#!/bin/sh

# wait for db
until nc -z db 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

cd server

npx prisma migrate deploy

# npm run dev fails as there is no .env, so use the following
# exec npx tsx watch ./src/index.ts

exec npm run dev:docker
