# TaskBox Dockerfiles and Docker Compose

In this guide, I explain my settings in [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile) and [docker-compose.yml](../docker-compose.yml).

I use a Dockerfile to describe how to build an image. An image contains the files and software needed to run an application. A container runs from that image. I use Compose to build, connect and start my services together.

## 1. Frontend Dockerfile

I use two stages in my frontend Dockerfile:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Build stage

- `FROM node:20-alpine AS build` gives me Node.js to build the frontend. Alpine is a small Linux base image.
- `WORKDIR /app` sets `/app` as the folder where the next commands run inside this stage.
- `COPY package*.json ./` copies `package.json` and `package-lock.json` before my source code.
- `RUN npm ci` installs the packages listed in the lockfile, including my build tools.
- `COPY . .` copies the remaining frontend files, excluding files listed in `.dockerignore`.
- `RUN npm run build` checks TypeScript and runs Vite, saving the built HTML, JavaScript and CSS files in `/app/dist`.

I copy the package files first so Docker can reuse the saved install step when I only change source code. If I change a package file or an earlier build step, Docker may need to install the packages again.

### Runtime stage

I start the final stage with `FROM nginx:alpine`. I copy only the built files and my Nginx settings into it. My final frontend image does not contain Node.js, source code or frontend packages.

`EXPOSE 80` documents the intended port. The Nginx configuration makes Nginx listen on port 80. I use Compose to make this port available from my computer. I do not add a `CMD` because the Nginx image already has a command that starts Nginx.

After the build, I use one final frontend image and run one web container.

### Nginx configuration

[nginx.conf](../frontend/nginx.conf) tells Nginx to:

- Serve React's built HTML, JavaScript and CSS.
- Forward `/api/` requests to `http://api:3000`, keeping the original request path.
- Return `index.html` for frontend navigation when a file is not found.
- Compress text files before sending them, when supported, and let the browser cache built assets for seven days.
- Allow requests up to `6m`. This gives enough space for a 5 MiB image and the extra upload data.

For example, the browser requests `/api/boards` from `localhost:8080`. Nginx receives it and forwards it to Express. Express returns JSON through Nginx to the browser. React uses that data to update the screen.

React runs in the browser. Nginx serves its files and forwards HTTP requests; it does not execute React click handlers.

## 2. Backend Dockerfile

I also use two stages for my backend. Both use `node:20-slim`, which is based on Debian Linux. I chose it for my Prisma and OpenSSL setup. Using the same base in both stages also lets me copy the installed packages between them.

### Build stage

The main instructions are:

```dockerfile
FROM node:20-slim AS build
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
ENV CHECKPOINT_DISABLE=1
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
```

I install OpenSSL because Prisma needs it in my setup. Python, make and g++ can build native packages if a ready-made version is unavailable. I remove the downloaded package lists to save image space.

I use `CHECKPOINT_DISABLE=1` to turn off Prisma update checks. I copy the Prisma schema before installing packages because Prisma can use it during installation. `prisma generate` creates the client my code uses to access the database. `npm run build` compiles my TypeScript into JavaScript in `/app/dist`.

### Runtime stage

I start the final stage from `node:20-slim` again. I install OpenSSL and set `NODE_ENV=production` for production settings. I also turn off Prisma update checks. I leave the TypeScript compiler and native build tools in the build stage.

```dockerfile
FROM node:20-slim
# OpenSSL installation and environment settings are explained above.
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev
COPY --chown=node:node --from=build /app/dist ./dist
EXPOSE 3000
```

I use `USER node` to run my API as the `node` user instead of root. Root has more permissions, so using `node` reduces what the API can access. `chown` and `COPY --chown` make the files belong to this user. Both containers can use `/app` because each has its own view of the files.

I copy `node_modules` so I do not install the same packages twice. `npm prune --omit=dev` removes packages used only for development. I keep the generated Prisma client. I also keep Prisma's command-line tool because I use it when the API starts.

### Healthcheck

I use Node's built-in `fetch` to call `http://localhost:3000/api/health`. A successful response exits with code 0; a failed request or unsuccessful status exits with code 1. This avoids installing curl just for the check.

The check runs every 10 seconds, with a five-second timeout, a 20-second startup grace period and five retries. The API health endpoint checks database connectivity and returns HTTP `503` when the database is unavailable.

### Startup and graceful shutdown

```dockerfile
CMD ["sh", "-c", "npx prisma db push --skip-generate && exec node dist/index.js"]
```

The shell first creates or updates the database tables to match my Prisma schema. `&&` starts Node only if that command succeeds. `--skip-generate` reuses the Prisma client generated during the build. This is a simple way to set up tables for my demo. It does not keep a history of database changes like migrations do.

`exec node` replaces the shell, so Node becomes PID 1 inside the container. Docker can send its stop signal directly to Node. The handlers in `index.ts` close the HTTP server and disconnect Prisma before exiting. Docker gives the container its own view of processes, called a PID namespace. `exec` only replaces the shell.

## 3. Files excluded from builds

Both `.dockerignore` files exclude local `node_modules`, `.env`, `dist`, Git files and logs. This keeps local packages and secrets out of the files sent to the build. Docker installs dependencies and builds the application inside its own stages.

## 4. Docker Compose services

| Service | Image/build | Configuration |
| --- | --- | --- |
| `web` | `./frontend` | Publishes `8080:80`; waits for API health |
| `api` | `./backend` | Reads `.env`; internal port 3000; waits for database health |
| `db` | `postgres:16-alpine` | Reads PostgreSQL variables; internal port 5432; stores files in a named volume |

The database uses an official image, so it does not need a custom Dockerfile. Fixed container names are `taskbox-web`, `taskbox-api` and `taskbox-db`.

### Ports and networking

All services join the `taskbox-net` bridge network. Docker DNS resolves service names, so Nginx uses `api:3000` and `DATABASE_URL` uses `db:5432`.

I only publish a port for `web`. `8080:80` maps the computer's port 8080 to Nginx's port 80. The API's `expose: 3000` documents its internal port; it does not publish it or create a firewall rule. Services on the same network can communicate without `expose`.

### Environment variables

Compose reads `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}` and `${POSTGRES_DB}` from my root `.env` file. The database receives those three settings. The API uses `env_file: .env` for its database URL, JWT secret and optional Cloudinary settings.

PostgreSQL uses these settings when it creates the database for the first time. Changing `.env` later does not change the username or password already saved in the database.

### Keeping database data

```yaml
volumes:
  - pgdata:/var/lib/postgresql/data
```

I give this volume the name `taskbox-pgdata`. It stores database files separately from a container's writable layer. Plain `docker compose down` keeps it, so recreating containers preserves the database. `docker compose down -v` deletes it and its data.

### Starting services in order

The database healthcheck uses `pg_isready`. The API waits for the database to become healthy, and the web service waits for the API to become healthy.

These checks control the starting order. A service can still fail after it starts. `pg_isready` checks whether PostgreSQL accepts connections, while the API healthcheck checks its database query.

Every service uses `restart: unless-stopped`. This restarts exited containers unless deliberately stopped. A healthcheck becoming unhealthy does not itself restart the container.

### Resource limits

```yaml
mem_limit: 256m
cpus: 0.5
```

These settings apply to the running API container. Docker uses Linux cgroups to apply these limits. My API can use up to 256 MiB of memory and CPU time equal to half of one CPU core. This does not give it a separate half core. These settings limit the running container, not the image build.

The System page compares API process memory with the container memory limit. Process memory is not the total memory usage of every process in the container.

## 5. How I build and run the project

From the repository root, after creating `.env`:

```bash
docker compose up --build -d
docker compose ps
curl -i http://localhost:8080/api/health
```

Compose builds the application images, creates the network and volume if needed, and starts the services according to their health dependencies. Open `http://localhost:8080` to use TaskBox.

For complete setup instructions, see the [README](../README.md). For source layers, see [project structure](project-structure.md).
