FROM node:22-bullseye-slim AS base

FROM base AS server-dev
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*
WORKDIR /home/app
COPY ./server/package.json ./server/package.json
COPY ./server/package-lock.json ./server/package-lock.json
RUN cd server && npm install
ADD server server
RUN cd server && npx prisma generate
COPY ./docker-entrypoint.dev.sh ./
EXPOSE 3000
ENTRYPOINT [ "sh", "./docker-entrypoint.dev.sh" ]

FROM server-dev AS server-builder
WORKDIR /home/app/server
RUN npm run build

FROM base AS production
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*
WORKDIR /home/app
COPY --from=server-builder /home/app/server/dist ./server/dist
COPY --from=server-builder /home/app/server/prisma ./server/prisma
COPY --from=server-builder /home/app/server/node_modules ./server/node_modules
COPY ./docker-entrypoint.prod.sh ./
EXPOSE 3001
ENTRYPOINT [ "sh", "./docker-entrypoint.prod.sh" ]