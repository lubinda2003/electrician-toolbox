import { isInvalidNumber } from "./types";

/**
 * Parses a raw string input (as typed into a form field) into a number,
 * or returns null if it isn't a usable number. Empty strings, whitespace,
 * and non-numeric text all return null rather than 0 or NaN, so callers
 * can distinguish "not entered" from "entered as zero".
 */
export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (isInvalidNumber(n)) return null;
  return n;
}

/** True if the value is present and strictly greater than zero. */
export function isPositive(n: number | null | undefined): n is number {
  return typeof n === "number" && !isInvalidNumber(n) && n > 0;
}

/** True if the value is present and greater than or equal to zero. */
export function isNonNegative(n: number | null | undefined): n is number {
  return typeof n === "number" && !isInvalidNumber(n) && n >= 0;
}

/**
 * Guards against results that are mathematically "valid" but practically
 * unusable (e.g. a bug that produces 1e300 ohms). This is intentionally a
 * very wide sanity ceiling — it exists to catch broken math, not to
 * enforce real-world engineering limits.
 */
export const SANITY_CEILING = 1e15;

export function isWithinSanityBounds(n: number): boolean {
  return !isInvalidNumber(n) && Math.abs(n) < SANITY_CEILING;
}
