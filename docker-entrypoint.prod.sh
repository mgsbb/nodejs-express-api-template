#!/bin/sh

# wait for db
until nc -z db 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

cd server

npx prisma migrate deploy

exec node ./dist/src/index.js
