# Один образ: збірка React + FastAPI (один публічний URL для демо)

FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# API на тому ж домені в production (порожній базовий URL)
ENV VITE_API_URL=
RUN npm run build

FROM python:3.12-slim AS backend
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    SERVE_FRONTEND=true \
    DEBUG=false \
    SEED_ON_STARTUP=true \
    DATABASE_URL=sqlite:////data/status_check.db

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY scripts/ ./scripts/
COPY --from=frontend /app/frontend/dist ./frontend/dist

RUN mkdir -p /data

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
