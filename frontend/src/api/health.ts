/**
 * Запит до GET /health — перевірка зв'язку frontend → backend.
 */

import { API_URL } from "../config";

/** Форма JSON-відповіді від GET /health */
export type HealthResponse = {
  status: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}
