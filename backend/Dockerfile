# build

FROM node:20-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# prevent Prisma update checks
ENV CHECKPOINT_DISABLE=1

WORKDIR /app

# cache npm ci layer 
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

RUN npx prisma generate

# compile into /app/dist
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# final image

FROM node:20-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV CHECKPOINT_DISABLE=1 \
    NODE_ENV=production

WORKDIR /app

RUN chown node:node /app

USER node

# layer caching
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma

COPY --chown=node:node --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev

# COPY --from=build
COPY --chown=node:node --from=build /app/dist ./dist

EXPOSE 3000

# Exit 0 = healthy, exit 1 = unhealthy
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "npx prisma db push --skip-generate && exec node dist/index.js"]
