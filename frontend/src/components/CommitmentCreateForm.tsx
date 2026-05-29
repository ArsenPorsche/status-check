/**
 * Ручне створення зобов'язання — POST /commitments.
 */

import { useState } from "react";
import {
  createCommitment,
  type CommitmentStatus,
} from "../api/commitments";

const STATUS_OPTIONS: CommitmentStatus[] = [
  "to check",
  "done",
  "not actual",
  "ideas backlog",
];

type Props = {
  onCreated: () => void;
};

/** datetime-local → ISO рядок для API */
function toIsoDeadline(localValue: string): string {
  return new Date(localValue).toISOString();
}

export default function CommitmentCreateForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<CommitmentStatus>("to check");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createCommitment({
        title,
        description: description || null,
        project,
        assignee,
        reviewer,
        deadline: toIsoDeadline(deadline),
        status,
      });
      setTitle("");
      setDescription("");
      setProject("");
      setAssignee("");
      setReviewer("");
      setDeadline("");
      setStatus("to check");
      onCreated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form create-form" onSubmit={handleSubmit}>
      <h3>Create manually</h3>

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

      <button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Create commitment"}
      </button>
    </form>
  );
}
