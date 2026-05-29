/**
 * Список зобов'язань + фільтри project / reviewer (крок 4).
 */

import { useCallback, useEffect, useState } from "react";
import {
  fetchCommitments,
  type Commitment,
  type ListFilters,
} from "../api/commitments";
import CommitmentCreateSection from "./CommitmentCreateSection";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString();
}

function statusClass(status: Commitment["status"]): string {
  if (status === "expired") return "badge expired";
  if (status === "done") return "badge done";
  if (status === "not actual") return "badge muted";
  if (status === "ideas backlog") return "badge backlog";
  return "badge";
}

export default function CommitmentList() {
  const [items, setItems] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Значення в полях форми фільтрів
  const [project, setProject] = useState("");
  const [reviewer, setReviewer] = useState("");
  // Останні застосовані фільтри (щоб після create оновити той самий список)
  const [appliedFilters, setAppliedFilters] = useState<ListFilters>({});

  const load = useCallback(async (filters: ListFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCommitments(filters);
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Перше завантаження — усі записи
  useEffect(() => {
    load({});
  }, [load]);

  function handleApplyFilters(event: React.FormEvent) {
    event.preventDefault();
    const filters = {
      project: project || undefined,
      reviewer: reviewer || undefined,
    };
    setAppliedFilters(filters);
    load(filters);
  }

  function handleClearFilters() {
    setProject("");
    setReviewer("");
    setAppliedFilters({});
    load({});
  }

  function handleCreated() {
    load(appliedFilters);
  }

  return (
    <>
      <CommitmentCreateSection onCreated={handleCreated} />

      <section className="panel">
        <h2>Commitments</h2>

      <form className="filters" onSubmit={handleApplyFilters}>
        <label>
          Project
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g. Backend"
          />
        </label>
        <label>
          Reviewer
          <input
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="e.g. Anna"
          />
        </label>
        <div className="filter-actions">
          <button type="submit">Apply filters</button>
          <button type="button" className="secondary" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="empty">No commitments found.</p>
      )}

      {!loading && items.length > 0 && (
        <ul className="commitment-list">
          {items.map((item) => (
            <li key={item.id} className="commitment-card">
              <div className="card-top">
                <strong>{item.title}</strong>
                <span className={statusClass(item.status)}>{item.status}</span>
              </div>
              {item.description && (
                <p className="description">{item.description}</p>
              )}
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
            </li>
          ))}
        </ul>
      )}
      </section>
    </>
  );
}
