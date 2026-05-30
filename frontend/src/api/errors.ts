/**
 * Помилки HTTP-відповідей FastAPI (detail: string або validation array).
 */

type ValidationIssue = { msg: string };

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function readApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string | ValidationIssue[];
    };
    if (typeof data.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail.map((item) => item.msg).join("; ");
    }
  } catch {
    // ignore
  }
  return `Request failed: ${response.status}`;
}

export async function assertOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }
  throw new ApiError(await readApiError(response), response.status);
}
