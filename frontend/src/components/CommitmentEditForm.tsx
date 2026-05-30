/**
 * Форма редагування зобов'язання — PATCH /commitments/{id}.
 */

import { useState } from "react";
import {
  updateCommitment,
  type Commitment,
  type CommitmentStatus,
} from "../api/commitments";

const STATUS_OPTIONS: CommitmentStatus[] = [
  "to check",
  "done",
  "not actual",
  "ideas backlog",
];

type Props = {
  item: Commitment;
  onSaved: () => void;
  onCancel: () => void;
};

/** ISO → значення для <input type="datetime-local"> */
function isoToDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function toIsoDeadline(localValue: string): string {
  return new Date(localValue).toISOString();
}

function initialStatus(item: Commitment): CommitmentStatus {
  if (item.status === "expired") {
    return "to check";
  }
  return STATUS_OPTIONS.includes(item.status as CommitmentStatus)
    ? (item.status as CommitmentStatus)
    : "to check";
}

export default function CommitmentEditForm({ item, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [project, setProject] = useState(item.project);
  const [assignee, setAssignee] = useState(item.assignee);
  const [reviewer, setReviewer] = useState(item.reviewer);
  const [deadline, setDeadline] = useState(isoToDatetimeLocal(item.deadline));
  const [status, setStatus] = useState<CommitmentStatus>(initialStatus(item));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updateCommitment(item.id, {
        title,
        description: description || null,
        project,
        assignee,
        reviewer,
        deadline: toIsoDeadline(deadline),
        status,
      });
      onSaved();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form edit-inline" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </label>

      <label>
        Project
        <input value={project} onChange={(e) => setProject(e.target.value)} required />
      </label>

      <label>
        Assignee
        <input value={assignee} onChange={(e) => setAssignee(e.target.value)} required />
      </label>

      <label>
        Reviewer
        <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} required />
      </label>

      <label>
        Deadline
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </label>

      <label>
        Status
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CommitmentStatus)}
        >
          {STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}

      <div className="edit-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </button>
        <button type="button" className="secondary" disabled={loading} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
