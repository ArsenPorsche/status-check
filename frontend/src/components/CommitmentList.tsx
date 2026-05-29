/**
 * Список зобов'язань + фільтри + форми створення (крок 4–6).
 */

import { useCallback, useEffect, useState } from "react";
import { fetchCommitments, type ListFilters } from "../api/commitments";
import CommitmentCard from "./CommitmentCard";
import CommitmentCalendar from "./CommitmentCalendar";
import CommitmentCreateSection from "./CommitmentCreateSection";

type ViewMode = "list" | "calendar";

export default function CommitmentList() {
  const [view, setView] = useState<ViewMode>("calendar");
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchCommitments>>>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState("");
  const [reviewer, setReviewer] = useState("");
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

  function handleListChange() {
    load(appliedFilters);
  }

  return (
    <>
      <CommitmentCreateSection onCreated={handleListChange} />

      <section className="panel">
        <div className="panel-head">
          <h2>Commitments</h2>
          <div className="view-tabs">
            <button
              type="button"
              className={view === "calendar" ? "tab active" : "tab"}
              onClick={() => setView("calendar")}
            >
              Calendar
            </button>
            <button
              type="button"
              className={view === "list" ? "tab active" : "tab"}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
        </div>

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
            <button
              type="button"
              className="secondary"
              onClick={handleClearFilters}
            >
              Clear
            </button>
          </div>
        </form>

        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="empty">No commitments found.</p>
        )}

        {!loading && items.length > 0 && view === "list" && (
          <ul className="commitment-list">
            {items.map((item) => (
              <CommitmentCard
                key={`${item.id}-${item.status}`}
                item={item}
                onChanged={handleListChange}
              />
            ))}
          </ul>
        )}

        {!loading && items.length > 0 && view === "calendar" && (
          <CommitmentCalendar items={items} onChanged={handleListChange} />
        )}
      </section>
    </>
  );
}
