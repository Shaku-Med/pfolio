# syntax=docker/dockerfile:1
#
# Portfolio public site only (no admin). Built from the monorepo root context
# because npm workspaces + package-lock live there.
# Secrets are NEVER copied in — compose injects app/.env at runtime.
#
# Node 22, not 20: supabase-js always constructs a RealtimeClient, which needs a
# global WebSocket. That only exists natively from Node 22 — on 20 createClient()
# throws "native WebSocket not found" and every loader 500s. Do not downgrade.

############################  deps (incl. dev, for build)  #################
FROM node:22-alpine AS deps
WORKDIR /src
COPY package.json package-lock.json ./
COPY app/package.json ./app/
RUN npm ci -w app

############################  production deps only  ########################
FROM node:22-alpine AS prod-deps
WORKDIR /src
COPY package.json package-lock.json ./
COPY app/package.json ./app/
RUN npm ci -w app --omit=dev

############################  build  #######################################
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
COPY app ./app
COPY --from=deps /src/node_modules ./node_modules
WORKDIR /src/app
RUN npm run copy-themes && npm run build

############################  runtime  #####################################
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    npm_config_update_notifier=false \
    npm_config_fund=false

RUN apk add --no-cache wget

WORKDIR /app

# Workspace layout kept so package name resolution matches install
COPY package.json package-lock.json ./
COPY app/package.json ./app/
COPY --from=prod-deps /src/node_modules ./node_modules
COPY --from=build /src/app/build ./app/build
COPY --from=build /src/app/public ./app/public

RUN chown -R node:node /app
USER node

WORKDIR /app/app
EXPOSE 3000

# Env vars come from compose `env_file` / `environment` (no dotenv-cli needed).
# Workspace hoists bins to /app/node_modules.
CMD ["../node_modules/.bin/react-router-serve", "./build/server/index.js"]
