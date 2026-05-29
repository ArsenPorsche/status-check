# Status Check

Calendar tracker for PMs to monitor team commitments and deadlines (FastAPI + SQLite).

## Setup

```bash
cd /d/zero/PL/pets/status-check
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
```

## Environment (`.env`)

We **do not commit** `.env` (see `.gitignore`). Only `.env.example` is updated in git.

When new variables are added (e.g. OpenAI):

1. Open your local `.env` (create from example if needed):

   ```bash
   cp .env.example .env
   ```

2. Add or edit lines manually, for example:

   ```env
   OPENAI_API_KEY=sk-your-real-key
   OPENAI_MODEL=gpt-4o-mini
   ```

3. **Restart the server** after changing `.env`:

   ```bash
   .venv/Scripts/uvicorn app.main:app --reload
   ```

   `--reload` watches Python files, not `.env`. Settings are loaded once (`@lru_cache` on `get_settings()`), so a running server will not pick up new keys until restart.

## Run

```bash
.venv/Scripts/uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

## Auth flow (Swagger)

1. `POST /auth/register` — JSON body
2. `POST /auth/login` — form: `username`, `password`
3. **Authorize** — paste `access_token`
4. Call protected endpoints

## Main endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | no |
| POST | `/auth/login` | no |
| GET | `/auth/me` | Bearer |
| GET | `/commitments` | Bearer |
| GET | `/commitments/{id}` | Bearer |
| POST | `/commitments` | Bearer |
| PATCH | `/commitments/{id}` | Bearer |
| DELETE | `/commitments/{id}` | Bearer |
| POST | `/commitments/ai-create` | Bearer + `OPENAI_API_KEY` |

Filters: `GET /commitments?project=Backend&reviewer=Anna`

Auto-expiry: if `deadline` is past and `status` is not `done`, API returns `"status": "expired"`.

## Frontend (React + Vite)

```bash
cd /d/zero/PL/pets/status-check/frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project layout

```
app/                # FastAPI backend
frontend/           # React UI (Vite)
  src/
    main.tsx        # entry
    App.tsx         # root component
```

## Example: AI create

```json
POST /commitments/ai-create
{
  "raw_text": "Misha promised to deliver the API for Backend by next Tuesday. Anna is the reviewer."
}
```
