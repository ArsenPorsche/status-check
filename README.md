# Status Check

Calendar tracker for PMs to monitor team commitments and deadlines.

**Stack:** FastAPI · SQLite · React · Vite · JWT · OpenAI (optional)

## Features

- Register / login with JWT
- Commitments CRUD with project and reviewer filters (case-insensitive)
- Shared visibility: everyone sees all commitments; only the author can edit or delete
- Auto-expiry: past deadlines return status `"expired"` unless marked `"done"`
- AI create from free text
- Calendar and list views

## Setup

Backend and frontend run in separate terminals.

**Backend** (project root):

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
cp .env.example .env
.venv/Scripts/uvicorn app.main:app --reload
```

API: http://127.0.0.1:8000/docs

**Frontend**:

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173 — login or register, then manage commitments.

## Test data

Optional sample users and commitments (safe to re-run; skips existing rows):

```bash
.venv/Scripts/python -m scripts.seed_db
```

| Username | Password |
|----------|----------|
| `anna` | `password123` |
| `misha` | `password123` |
| `olena` | `password123` |

Includes mixed projects, deadlines, and statuses (including past deadlines for auto-expiry).

## Configuration

Copy `.env.example` → `.env` and `frontend/.env.example` → `frontend/.env.local`, then set:

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | JWT signing |
| `OPENAI_API_KEY` | AI create (`/commitments/ai-create`) |
| `VITE_API_URL` | Backend URL for frontend (default `http://127.0.0.1:8000`) |

See example files for all options.

## API

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | — |
| POST | `/auth/login` | — |
| GET | `/auth/me` | Bearer |
| GET | `/commitments` | Bearer |
| GET | `/commitments/{id}` | Bearer |
| POST | `/commitments` | Bearer |
| PATCH | `/commitments/{id}` | Bearer (author) |
| DELETE | `/commitments/{id}` | Bearer (author) |
| POST | `/commitments/ai-create` | Bearer |

Filters: `GET /commitments?project=backend&reviewer=anna`

## Deploy (live demo URL)

For a **single public link** (UI + API on one domain), use Docker. This matches how non-technical stakeholders usually access a product.

### Option A — Render (recommended)

1. Push the repo to Git hosting (GitLab, Bitbucket, etc.) — only as a source for Render, not as the demo itself.
2. [Render](https://render.com) → **New** → **Blueprint** → connect the repo.
3. Render reads [`render.yaml`](render.yaml): builds the Docker image, mounts a 1 GB disk for SQLite, generates `SECRET_KEY`, seeds demo data on first boot.
4. After deploy, open the service URL (e.g. `https://status-check-xxxx.onrender.com`).

**Demo logins** (if `SEED_ON_STARTUP=true`): `anna` / `misha` / `olena`, password `password123`.

Optional: set `OPENAI_API_KEY` in Render **Environment** for AI create.

Free tier may sleep after inactivity; the first request can take ~30s to wake.

### Option B — Docker anywhere

```bash
docker build -t status-check .
docker run --rm -p 8000:8000 \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  -e SERVE_FRONTEND=true \
  -e SEED_ON_STARTUP=true \
  -v status-check-data:/data \
  status-check
```

Open http://localhost:8000

### Production env

| Variable | Purpose |
|----------|---------|
| `SERVE_FRONTEND` | `true` — serve built React from `frontend/dist` |
| `SEED_ON_STARTUP` | `true` — load demo users/commitments on boot |
| `DATABASE_URL` | e.g. `sqlite:////data/status_check.db` with a persistent volume |
| `SECRET_KEY` | Long random string (required in production) |
| `CORS_ORIGINS` | Only if UI and API are on different hosts (comma-separated) |
| `DEBUG` | `false` in production |
