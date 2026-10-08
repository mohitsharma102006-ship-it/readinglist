import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Plus,
  Library,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { Book, FilterValue, ReadingStatus } from './types';
import {
  STATUS_META,
  STATUS_ORDER,
} from './types';
import { loadBooks, saveBooks } from './storage';

function uid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
];

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  useEffect(() => {
    setBooks(loadBooks());
  }, []);

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  const counts = useMemo(() => {
    const c: Record<ReadingStatus, number> = {
      'want-to-read': 0,
      reading: 0,
      finished: 0,
    };
    books.forEach((b) => (c[b.status] += 1));
    return c;
  }, [books]);

  const visible = useMemo(() => {
    if (filter === 'all') return books;
    return books.filter((b) => b.status === filter);
  }, [books, filter]);

  function addBook(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setBooks((prev) => [
      { id: uid(), title: trimmed, status: 'want-to-read' },
      ...prev,
    ]);
    setTitle('');
  }

  function setStatus(id: string, status: ReadingStatus) {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    setMenuOpenFor(null);
  }

  function removeBook(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setMenuOpenFor(null);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white">
            <Library size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Reading List
            </h1>
            <p className="text-sm text-stone-500">
              {books.length} book{books.length === 1 ? '' : 's'} ·{' '}
              {counts.reading} reading · {counts.finished} finished
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
        {/* Add form */}
        <form
          onSubmit={addBook}
          className="flex gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a book title…"
            className="flex-1 rounded-xl bg-stone-100 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:bg-stone-50 focus:ring-2 focus:ring-stone-900/10"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} /> Add
          </button>
        </form>

        {/* Filters */}
        {books.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              const count =
                f.value === 'all'
                  ? books.length
                  : counts[f.value as ReadingStatus];
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {f.label}
                  <span
                    className={`text-xs ${
                      active ? 'text-white/70' : 'text-stone-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* List */}
        <div className="mt-4 space-y-2.5">
          {books.length === 0 ? (
            <EmptyState />
          ) : visible.length === 0 ? (
            <NoMatches />
          ) : (
            visible.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                menuOpen={menuOpenFor === book.id}
                onToggleMenu={() =>
                  setMenuOpenFor((cur) => (cur === book.id ? null : book.id))
                }
                onSetStatus={(s) => setStatus(book.id, s)}
                onRemove={() => removeBook(book.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        <BookOpen size={26} />
      </div>
      <p className="text-base font-medium text-stone-700">
        Your reading list is empty. Add your first book.
      </p>
      <p className="mt-1 text-sm text-stone-400">
        Use the box above to get started.
      </p>
    </div>
  );
}

function NoMatches() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-400">
      No books match this filter.
    </div>
  );
}

interface BookCardProps {
  book: Book;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onSetStatus: (s: ReadingStatus) => void;
  onRemove: () => void;
}

function BookCard({
  book,
  menuOpen,
  onToggleMenu,
  onSetStatus,
  onRemove,
}: BookCardProps) {
  const meta = STATUS_META[book.status];
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
      <span
        className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium leading-snug text-stone-900">
          {book.title}
        </p>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={onToggleMenu}
          aria-label="Change status"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
        >
          Status
          <ChevronDown
            size={14}
            className={`transition ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={onToggleMenu}
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              {STATUS_ORDER.map((s) => {
                const m = STATUS_META[s];
                const selected = book.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onSetStatus(s)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${m.dot}`}
                      />
                      {m.label}
                    </span>
                    {selected && (
                      <Check size={15} className="text-stone-400" />
                    )}
                  </button>
                );
              })}
              <div className="my-1 border-t border-stone-100" />
              <button
                onClick={onRemove}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
