FROM node:22.23-alpine3.23 AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build

FROM node:22.23-alpine3.23 AS runner

ENV NODE_ENV=production

WORKDIR /usr/src/app

# package.json est aussi lu au démarrage pour la version Swagger
COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
