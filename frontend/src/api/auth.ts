/**
 * HTTP-запити до /auth/* (реєстрація, логін, поточний користувач).
 */

import { API_URL } from "../config";
import { clearToken, getToken, setToken } from "../auth/token";
import { ApiError, readApiError } from "./errors";

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
};

export type RegisterBody = {
  username: string;
  email: string;
  full_name: string;
  password: string;
};

/** Заголовок Authorization для захищених ендпоінтів */
export function authHeaders(): HeadersInit {
  const token = getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function register(body: RegisterBody): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return response.json() as Promise<UserResponse>;
}

/**
 * Логін — form-urlencoded (як OAuth2PasswordRequestForm у FastAPI).
 */
export async function login(username: string, password: string): Promise<void> {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const data = (await response.json()) as TokenResponse;
  setToken(data.access_token);
}

export async function fetchMe(): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return response.json() as Promise<UserResponse>;
}

export function logout(): void {
  clearToken();
}
