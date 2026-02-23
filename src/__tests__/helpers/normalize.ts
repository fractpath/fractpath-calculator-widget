export function normalizeTimestamps(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(obj)) return "__TS__";
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(normalizeTimestamps);
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === "computed_at" || k === "created_at" || k === "now_iso") {
        out[k] = "__TS__";
      } else {
        out[k] = normalizeTimestamps(v);
      }
    }
    return out;
  }
  return obj;
}
