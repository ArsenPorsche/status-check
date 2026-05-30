/**
 * Допоміжні функції для місячного календаря (без зовнішніх бібліотек).
 */

import { UI_LOCALE } from "../config";

/** YYYY-MM-DD у локальній timezone браузера */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** День дедлайну з ISO-рядка API */
export function deadlineToDateKey(iso: string): string {
  return toDateKey(new Date(iso));
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/**
 * Сітка 6×7: для кожної клітинки дата або null (порожня клітинка до/після місяця).
 */
export function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  // Понеділок = перший стовпець (у JS getDay(): 0=Нд, 1=Пн, ...)
  const startOffset = (first.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleString(UI_LOCALE, {
    month: "long",
    year: "numeric",
  });
}
