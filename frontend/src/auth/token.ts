/**
 * Зберігання JWT у браузері (localStorage).
 * Ключ один на весь застосунок — не розкидаємо рядки по файлах.
 */

const TOKEN_KEY = "status_check_access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
