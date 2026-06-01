/**
 * Адреса FastAPI backend.
 * VITE_API_URL з .env.local або значення за замовчуванням.
 */
// У production — той самий хост (порожній базовий URL); у dev — окремий бекенд
export const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? "" : "http://127.0.0.1:8000");

/** Локаль для дат у UI (назви місяців тощо) */
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
