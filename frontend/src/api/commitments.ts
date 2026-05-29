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
