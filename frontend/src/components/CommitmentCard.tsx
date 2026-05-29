/**
 * Одна картка зобов'язання: зміна статусу (PATCH) та видалення (DELETE).
 */

import { useState } from "react";
import {
  deleteCommitment,
  updateCommitment,
  type Commitment,
  type CommitmentStatus,
} from "../api/commitments";

const EDITABLE_STATUSES: CommitmentStatus[] = [
  "to check",
  "done",
  "not actual",
  "ideas backlog",
];

type Props = {
  item: Commitment;
  onChanged: () => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function statusClass(status: Commitment["status"]): string {
  if (status === "expired") return "badge expired";
  if (status === "done") return "badge done";
  if (status === "not actual") return "badge muted";
  if (status === "ideas backlog") return "badge backlog";
  return "badge";
}

export default function CommitmentCard({ item, onChanged }: Props) {
  const [status, setStatus] = useState<CommitmentStatus>(
    item.status === "expired" ? "to check" : item.status,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: CommitmentStatus) {
    setStatus(newStatus);
    setError(null);
    setBusy(true);

    try {
      await updateCommitment(item.id, { status: newStatus });
      onChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus(item.status === "expired" ? "to check" : item.status);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(`Delete "${item.title}"?`);
    if (!ok) {
      return;
    }

    setError(null);
    setBusy(true);

    try {
      await deleteCommitment(item.id);
      onChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="commitment-card">
      <div className="card-top">
        <strong>{item.title}</strong>
        <span className={statusClass(item.status)}>{item.status}</span>
      </div>

      {item.description && <p className="description">{item.description}</p>}

      <dl className="meta">
        <div>
          <dt>Project</dt>
          <dd>{item.project}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{item.assignee}</dd>
        </div>
        <div>
          <dt>Reviewer</dt>
          <dd>{item.reviewer}</dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd>{formatDate(item.deadline)}</dd>
        </div>
      </dl>

      <div className="card-actions">
        <label className="status-edit">
          Set status
          <select
            value={EDITABLE_STATUSES.includes(status) ? status : "to check"}
            disabled={busy}
            onChange={(e) =>
              handleStatusChange(e.target.value as CommitmentStatus)
            }
          >
            {EDITABLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="danger"
          disabled={busy}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>

      {item.status === "expired" && (
        <p className="hint">
          Shown as expired (deadline passed). Set to done or change status to
          update.
        </p>
      )}

      {error && <p className="error">{error}</p>}
    </li>
  );
}
