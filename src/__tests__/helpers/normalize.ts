export function normalizeTimestamps(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) return obj.map(normalizeTimestamps);

  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      // Normalize only known timestamp keys to avoid masking nondeterminism elsewhere.
      if (
        k === "computed_at" ||
        k === "created_at" ||
        k === "updated_at" ||
        k === "now_iso"
      ) {
        out[k] = "__TS__";
      } else {
        out[k] = normalizeTimestamps(v);
      }
    }
    return out;
  }

  // Leave primitive strings/numbers/booleans as-is.
  return obj;
}
