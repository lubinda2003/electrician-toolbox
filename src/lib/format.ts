/**
 * Formats a number for display: trims floating-point noise and keeps a
 * sensible number of significant digits without showing something like
 * 47.99999999999999.
 */
export function formatNumber(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(maxDecimals));
  return rounded.toLocaleString(undefined, { maximumFractionDigits: maxDecimals });
}

export function formatId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
