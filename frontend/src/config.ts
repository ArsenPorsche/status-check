/**
 * Адреса FastAPI backend.
 * VITE_API_URL з .env.local або значення за замовчуванням.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/** Locale for dates in UI (month names, etc.) */
export const UI_LOCALE = "en-US";
