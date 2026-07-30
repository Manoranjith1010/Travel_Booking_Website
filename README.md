# Travel Booking Website

A full-stack travel booking starter built with React, Node.js, Express, and MongoDB persistence.

## Features

- User registration and login with JWT
- Flight, hotel, and holiday package discovery
- Trip booking and cancellation
- Stripe-ready payment flow
- Booking history and admin overview
- Responsive UI for desktop and mobile

## Project Structure

```text
travel-booking/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- data/
|   |   |-- services/
|   |   `-- styles.css
|   `-- package.json
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- data/
|   |-- seed.js
|   `-- package.json
`-- README.md
```

## Run Locally

```bash
npm install
npm run dev:server
npm run dev:client
```

## Environment Variables

Server:

- PORT
- JWT_SECRET
- MONGO_URI
- STRIPE_SECRET_KEY
- CLIENT_ORIGIN

Client:

- VITE_API_URL

## MongoDB Seed Script

Use the server seed script to reset and repopulate MongoDB with starter data.

```bash
npm run seed --workspace server
```

What it seeds:

- Admin user (`admin@travelloop.com` / `Admin123!`)
- Travel packages
- Sample bookings linked to the admin user

## Notes

- With `MONGO_URI` configured, API reads/writes are persisted in MongoDB.
- Without `MONGO_URI`, the app runs in demo mode with an in-memory fallback.

## Deployment

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env` and fill in real values before deploying.

### Option 1: Render (Blueprint)

A `render.yaml` blueprint is included at the repo root defining two services:

- `travel-booking-api` — Node web service running `server/`
- `travel-booking-client` — static site built from `client/`

Steps:

1. Push the repo to GitHub.
2. In Render, choose **New > Blueprint** and select the repo (Render detects `render.yaml`).
3. Set the secret env vars flagged `sync: false` in the dashboard: `JWT_SECRET`, `MONGO_URI`, `STRIPE_SECRET_KEY`, `CLIENT_ORIGIN` (your client's Render URL) for the API service, and `VITE_API_URL` (your API's Render URL + `/api`) for the client service.
4. Deploy. Render builds both services automatically on every push.

### Option 2: Railway

Railway auto-detects the `Dockerfile` in each folder.

1. Create a new Railway project from the GitHub repo.
2. Add a service, set **Root Directory** to `server` (Railway will use `server/Dockerfile`). Set env vars: `JWT_SECRET`, `MONGO_URI`, `STRIPE_SECRET_KEY`, `CLIENT_ORIGIN`. Railway provides `PORT` automatically.
3. Add a second service, set **Root Directory** to `client` (Railway will use `client/Dockerfile`). Set build arg/env var `VITE_API_URL` to the deployed API URL + `/api`.
4. Deploy both services.

### Option 3: Docker / self-hosted

Dockerfiles are provided for both `server/` and `client/` (client is built and served via Nginx), plus a root `docker-compose.yml` for local or VPS use.

```bash
# from the repo root, with a .env file (or exported vars) containing
# JWT_SECRET, MONGO_URI, STRIPE_SECRET_KEY, CLIENT_ORIGIN, VITE_API_URL
docker compose up --build
```

- API available at `http://localhost:4000`
- Client available at `http://localhost:5173`

For a VPS, run the same `docker compose up --build -d` behind a reverse proxy (e.g. Nginx or Caddy) that terminates TLS and forwards to these ports.
