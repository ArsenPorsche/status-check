/**
 * HTTP-запити до /commitments (потрібен Bearer token).
 */

import { authHeaders } from "./auth";
import { API_URL } from "../config";

export type CommitmentStatus =
  | "to check"
  | "expired"
  | "done"
  | "not actual"
  | "ideas backlog";

export type Commitment = {
  id: number;
  author_id: number;
  title: string;
  description: string | null;
  created_at: string;
  project: string;
  assignee: string;
  reviewer: string;
  deadline: string;
  status: CommitmentStatus;
};

export type ListFilters = {
  project?: string;
  reviewer?: string;
};

export type CreateCommitmentBody = {
  title: string;
  description?: string | null;
  project: string;
  assignee: string;
  reviewer: string;
  deadline: string;
  status?: CommitmentStatus;
};

export async function fetchCommitments(
  filters: ListFilters = {},
): Promise<Commitment[]> {
  const params = new URLSearchParams();

  if (filters.project?.trim()) {
    params.set("project", filters.project.trim());
  }
  if (filters.reviewer?.trim()) {
    params.set("reviewer", filters.reviewer.trim());
  }

  const query = params.toString();
  const url = query
    ? `${API_URL}/commitments?${query}`
    : `${API_URL}/commitments`;

  const response = await fetch(url, {
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load commitments: ${response.status}`);
  }

  return response.json() as Promise<Commitment[]>;
}

export async function createCommitment(
  body: CreateCommitmentBody,
): Promise<Commitment> {
  const response = await fetch(`${API_URL}/commitments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<Commitment>;
}

export type UpdateCommitmentBody = {
  title?: string;
  description?: string | null;
  project?: string;
  assignee?: string;
  reviewer?: string;
  deadline?: string;
  status?: CommitmentStatus;
};

export async function updateCommitment(
  id: number,
  body: UpdateCommitmentBody,
): Promise<Commitment> {
  const response = await fetch(`${API_URL}/commitments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<Commitment>;
}

export async function deleteCommitment(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/commitments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function aiCreateFromText(rawText: string): Promise<Commitment> {
  const response = await fetch(`${API_URL}/commitments/ai-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ raw_text: rawText }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<Commitment>;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    // ignore
  }
  return `Request failed: ${response.status}`;
}
