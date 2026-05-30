/**
 * Адреса FastAPI backend.
 * VITE_API_URL з .env.local або значення за замовчуванням.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/** Locale for dates in UI (month names, etc.) */
export const UI_LOCALE = "en-US";

/** Ліміти полів — як у бекенді (Pydantic schemas) */
export const LIMITS = {
  username: 100,
  fullName: 255,
  password: 72,
  commitmentTitle: 500,
  commitmentField: 255,
  aiRawText: 1000,
} as const;
