/**
 * Thin, safe wrapper around localStorage. Every calculation and preference
 * stays on this device — nothing here ever sends data to a server.
 */

function isStorageAvailable(): boolean {
  try {
    const testKey = "__et_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = typeof window !== "undefined" && isStorageAvailable();

export function readJSON<T>(key: string, fallback: T): T {
  if (!storageAvailable) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!storageAvailable) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled — fail silently, the app still works.
  }
}

export function remove(key: string): void {
  if (!storageAvailable) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
