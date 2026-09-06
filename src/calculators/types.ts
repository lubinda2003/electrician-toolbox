/**
 * Shared types for all calculator engines.
 *
 * Every calculator returns a `CalcResult<T>` — either `ok: true` with a
 * fully-typed, deterministic value, or `ok: false` with a human-readable
 * `message` explaining exactly what is missing or invalid. UI components
 * must never receive NaN, Infinity, or undefined — engines are responsible
 * for catching those cases and returning a `CalcError` instead.
 */

export interface CalcError {
  ok: false;
  /** Human-readable message safe to show directly in the UI. */
  message: string;
}

export interface CalcSuccess<T> {
  ok: true;
  value: T;
}

export type CalcResult<T> = CalcSuccess<T> | CalcError;

export function ok<T>(value: T): CalcSuccess<T> {
  return { ok: true, value };
}

export function err(message: string): CalcError {
  return { ok: false, message };
}

/** True for any value that is not a finite, usable number. */
export function isInvalidNumber(n: number | null | undefined): boolean {
  return n === null || n === undefined || Number.isNaN(n) || !Number.isFinite(n);
}
