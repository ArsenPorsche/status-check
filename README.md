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
