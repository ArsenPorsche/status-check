/**
 * Календарний вигляд: зобов'язання на даті deadline (вимога «calendar-based»).
 */

import { useMemo, useState } from "react";
import type { Commitment } from "../api/commitments";
import {
  addMonths,
  buildMonthGrid,
  deadlineToDateKey,
  monthLabel,
  toDateKey,
} from "../utils/calendar";
import CommitmentCard from "./CommitmentCard";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  items: Commitment[];
  currentUserId: number;
  onChanged: () => void;
};

function statusDotClass(status: Commitment["status"]): string {
  if (status === "expired") return "cal-dot expired";
  if (status === "done") return "cal-dot done";
  return "cal-dot";
}

export default function CommitmentCalendar({ items, currentUserId, onChanged }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(toDateKey(today));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = buildMonthGrid(year, month);

  const byDate = useMemo(() => {
    const map = new Map<string, Commitment[]>();
    for (const item of items) {
      const key = deadlineToDateKey(item.deadline);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items]);

  const selectedItems = selectedKey ? (byDate.get(selectedKey) ?? []) : [];

  return (
    <div className="calendar-wrap">
      <div className="calendar-toolbar">
        <button
          type="button"
          className="secondary"
          onClick={() => setCursor((c) => addMonths(c, -1))}
        >
          ← Prev
        </button>
        <strong>{monthLabel(year, month)}</strong>
        <button
          type="button"
          className="secondary"
          onClick={() => setCursor((c) => addMonths(c, 1))}
        >
          Next →
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((name) => (
          <div key={name} className="cal-head">
            {name}
          </div>
        ))}

        {weeks.flat().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="cal-cell empty" />;
          }

          const key = toDateKey(date);
          const dayItems = byDate.get(key) ?? [];
          const isToday = key === toDateKey(today);
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              type="button"
              className={`cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedKey(key)}
            >
              <span className="cal-day-num">{date.getDate()}</span>
              <div className="cal-dots">
                {dayItems.slice(0, 4).map((item) => (
                  <span
                    key={item.id}
                    className={statusDotClass(item.status)}
                    title={item.title}
                  />
                ))}
                {dayItems.length > 4 && (
                  <span className="cal-more">+{dayItems.length - 4}</span>
                )}
              </div>
              {dayItems.length > 0 && (
                <span className="cal-count">{dayItems.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <section className="cal-day-detail">
        <h3>
          {selectedKey
            ? `Deadlines on ${selectedKey}`
            : "Select a day"}
        </h3>
        {selectedItems.length === 0 && (
          <p className="empty">No commitments on this day.</p>
        )}
        {selectedItems.length > 0 && (
          <ul className="commitment-list">
            {selectedItems.map((item) => (
              <CommitmentCard
                key={`${item.id}-${item.status}`}
                item={item}
                currentUserId={currentUserId}
                onChanged={onChanged}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
