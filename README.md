# TaskBox

TaskBox is a Trello-inspired task management application built with React, TypeScript, Express, Prisma and PostgreSQL. Docker Compose runs the frontend, backend and database in separate containers. Nginx serves the built React files and forwards API requests to Express. Express handles application logic and uses Prisma to access PostgreSQL. Open the application at `http://localhost:8080` after starting the containers.

## Features

- Register, log in, view your profile and log out.
- Create, rename and delete boards.
- Create, rename, reorder and delete lists.
- Create, edit, move and delete cards.
- Add descriptions, labels, due dates, checklists and comments.
- Record task notes, such as who is doing the work, in card descriptions.
- Search and filter cards, and switch between board and table views.
- Export boards as CSV and share read-only card links.
- Upload card images with optional Cloudinary configuration.
- View API hostname, PID, uptime, database status and memory information.

All signed-in users can view and edit boards. Task descriptions can include who is doing the work.

## Video Demonstration

- [Watch the TaskBox demonstration on YouTube](https://youtu.be/L9hnPwT1eCo?si=xA-cXjXd-ZOjbTyv)

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), or Docker Engine with Docker Compose v2.
- A browser and internet access for the first image and package downloads.

Start Docker before continuing. You do not need to install Node.js, Yarn or PostgreSQL on your computer. The Dockerfiles install the required packages inside the images.

## Install and configure

Extract the submitted source-code ZIP, or download/clone this repository. Open the extracted project folder and find `docker-compose.yml`. Run the setup commands from this folder.

Copy the example configuration on first setup:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The provided settings are ready to use. Continue to **Build and run**. If you want to upload images, complete the optional Cloudinary setup below first.

### Optional image uploads

Add these values from your Cloudinary account to `.env`:

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_ROOT_FOLDER=taskbox
```

If the application is already running, apply the changed settings with:

```bash
docker compose up -d api
```

The other features work without Cloudinary.

## Build and run

From the project root:

```bash
docker compose up --build -d
```

This command builds the frontend and backend images and starts all three services. `--build` builds the images before starting, and `-d` leaves the containers running in the background. The first build may take longer while Docker downloads images and dependencies.

Open **http://localhost:8080**, register an account and log in. Create a board to start adding tasks. New boards contain To do, Doing and Done lists.

To check the services:

```bash
docker compose ps
```

Check that `web`, `api` and `db` are running. Wait for `api` and `db` to show `healthy`; they may show `starting` briefly.

To check API and database connectivity:

```bash
curl -i http://localhost:8080/api/health
```

A successful response has HTTP status `200`, `status: "ok"` and `database: "up"`.

## Stop, restart and update

Stop and remove the containers while keeping database data:

```bash
docker compose down
```

Start the application again:

```bash
docker compose up -d
```

After updating the source code, rebuild and start:

```bash
docker compose up --build -d
```

Database data remains in the named Docker volume. `docker compose down -v` also deletes that volume and its data.

## Common setup problems

- **Docker connection error:** start Docker Desktop or Docker Engine.
- **Port 8080 is busy:** stop the application using it, or change the host port in the web service's `ports` setting.
- **A service fails to start:** inspect its logs with `docker compose logs db api web` and check your `.env` settings. Changing PostgreSQL initialization settings does not change credentials already stored in an existing database volume.
- **Image uploads are disabled:** fill in all three Cloudinary credentials and run `docker compose up -d api`.
