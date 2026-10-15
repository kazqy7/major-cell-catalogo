import { useSyncExternalStore } from "react";

// Only product IDs are stored — no personal data.
const KEY = "majorcell:favorites";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

export function toggleFavorite(id: string) {
  const cur = readFavorites();
  cache = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

const EMPTY: string[] = [];
export function useFavorites() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readFavorites,
    () => EMPTY,
  );
}
