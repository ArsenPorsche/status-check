# Status Check

Calendar tracker for PMs to monitor team commitments and deadlines.

**Stack:** FastAPI + SQLite · React + Vite · JWT auth · optional OpenAI (LangChain)

---

## Features

- **Auth** — register, login, JWT bearer tokens
- **Commitments** — create, list, view, edit, delete with project/reviewer filters
- **Access model** — all logged-in users see all commitments; only the **author** can edit or delete their own
- **Auto-expiry** — if deadline passed and status is not `done`, API returns `"expired"` (computed on read)
- **AI create** — paste free text → OpenAI parses fields → saves a commitment
- **UI** — calendar view (deadlines on month grid) and list view; manual + AI create forms

---

## Quick start

### Backend

```bash
cd status-check
python -m venv .venv

# Windows
.venv\Scripts\pip install -r requirements.txt
cp .env.example .env

# macOS / Linux
# source .venv/bin/activate
# pip install -r requirements.txt
# cp .env.example .env

.venv\Scripts\uvicorn app.main:app --reload
```

- API docs: http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/health → `{"status":"ok"}`

### Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local   # optional, default API URL is fine for local dev
npm run dev
```

Open http://localhost:5173 — register or log in, then manage commitments.

---

## Environment

`.env` files are **not committed** (see `.gitignore`). Copy from examples and edit locally.

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `APP_NAME` | App title |
| `DEBUG` | FastAPI debug mode (`true` for local dev) |
| `DATABASE_URL` | Default: `sqlite:///./status_check.db` |
| `SECRET_KEY` | JWT signing key — use a long random string in production |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime (default `60`) |
| `OPENAI_API_KEY` | Required for `POST /commitments/ai-create` |
| `OPENAI_MODEL` | Default: `gpt-4o-mini` |

After changing `.env`, **restart uvicorn**. `--reload` watches Python files only; settings are cached at startup (`@lru_cache` on `get_settings()`).

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default `http://127.0.0.1:8000`) |

---

## API

### Auth

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | — | JSON: `username`, `email`, `full_name`, `password` |
| POST | `/auth/login` | — | Form: `username`, `password` → `access_token` |
| GET | `/auth/me` | Bearer | Current user |

Password: 6–72 characters. Usernames and emails must be unique.

### Commitments

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/commitments` | Bearer | List all; filters below |
| GET | `/commitments/{id}` | Bearer | Single item |
| POST | `/commitments` | Bearer | Author = current user |
| PATCH | `/commitments/{id}` | Bearer | **Author only** → 403 otherwise |
| DELETE | `/commitments/{id}` | Bearer | **Author only** → 403 otherwise |
| POST | `/commitments/ai-create` | Bearer | JSON: `{ "raw_text": "..." }` (max 1000 chars) |

**Filters** (case-insensitive):

```
GET /commitments?project=backend&reviewer=anna
```

**Auto-expiry:** stored status may stay `"to check"`, but response shows `"expired"` when deadline is in the past and status is not `"done"`.

### Swagger

1. `POST /auth/register` or `/auth/login`
2. **Authorize** → paste `access_token`
3. Call protected endpoints

---

## Frontend

| Area | Path |
|------|------|
| Entry | `frontend/src/main.tsx` |
| Auth + layout | `frontend/src/App.tsx` |
| API client | `frontend/src/api/` |
| Components | `frontend/src/components/` |
| Field limits (match backend) | `frontend/src/config.ts` → `LIMITS` |

**Behaviour:**

- JWT stored in `localStorage`
- Edit / delete / quick status hidden on cards you did not create
- Expired session (401 on list load) → automatic logout back to login form
- Calendar groups commitments by **local** deadline date

**Build for production:**

```bash
cd frontend
npm run build
npm run preview
```

---

## Project layout

```
status-check/
├── app/                    # FastAPI backend
│   ├── core/               # config, database
│   ├── models/             # SQLAlchemy (User, Commitment)
│   ├── schemas/            # Pydantic request/response
│   ├── routers/            # HTTP endpoints
│   ├── services/           # business logic, AI
│   └── main.py
├── frontend/               # React + Vite
│   └── src/
│       ├── api/
│       ├── auth/
│       ├── components/
│       └── utils/
├── requirements.txt
├── .env.example
└── status_check.db         # created on first run (gitignored)
```

---

## Production checklist

- Set a strong `SECRET_KEY` and `DEBUG=false` in `.env`
- Use HTTPS; do not expose default secrets
- Add your frontend origin to CORS in `app/main.py` (currently localhost only)
- Consider rate limiting on `/auth/login` and `/commitments/ai-create` if public
- SQLite is fine for a small team; migrate to PostgreSQL if you outgrow it

---

## Example: AI create

```http
POST /commitments/ai-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "raw_text": "Misha promised to deliver the API for Backend by next Tuesday. Anna is the reviewer."
}
```

Returns the same shape as `POST /commitments` (`CommitmentRead`).
