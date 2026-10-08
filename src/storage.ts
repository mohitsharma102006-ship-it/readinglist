import type { Book } from './types';

const KEY = 'reading-list:books';

export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Book =>
        b &&
        typeof b.id === 'string' &&
        typeof b.title === 'string' &&
        typeof b.status === 'string'
    );
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(books));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
