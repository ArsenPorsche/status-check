/**
 * Картка зобов'язання: перегляд, редагування, статус, видалення.
 */

import { useState } from "react";
import {
  deleteCommitment,
  updateCommitment,
  type Commitment,
  type CommitmentStatus,
} from "../api/commitments";
import { UI_LOCALE } from "../config";
import CommitmentEditForm from "./CommitmentEditForm";

const QUICK_STATUSES: CommitmentStatus[] = [
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
  return new Date(iso).toLocaleString(UI_LOCALE);
}

function statusClass(status: Commitment["status"]): string {
  if (status === "expired") return "badge expired";
  if (status === "done") return "badge done";
  if (status === "not actual") return "badge muted";
  if (status === "ideas backlog") return "badge backlog";
  return "badge";
}

export default function CommitmentCard({ item, onChanged }: Props) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleQuickStatus(newStatus: CommitmentStatus) {
    setError(null);
    setBusy(true);

    try {
      await updateCommitment(item.id, { status: newStatus });
      onChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
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

  if (editing) {
    return (
      <li className="commitment-card editing">
        <CommitmentEditForm
          item={item}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
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
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={() => setEditing(true)}
        >
          Edit
        </button>

        <label className="status-edit">
          Quick status
          <select
            defaultValue={item.status === "expired" ? "to check" : item.status}
            disabled={busy}
            onChange={(e) =>
              handleQuickStatus(e.target.value as CommitmentStatus)
            }
          >
            {QUICK_STATUSES.map((value) => (
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
          Shown as expired (deadline passed). Use Edit or set status to done.
        </p>
      )}

      {error && <p className="error">{error}</p>}
    </li>
  );
}
