export const text = (value: unknown): string => typeof value === "string" ? value : "";
export const list = (value: unknown): string[] => Array.isArray(value) ? value.map(v =>
  typeof v === "string" ? v : v && typeof v === "object" ? Object.values(v).filter(x => typeof x === "string").join(" · ") : ""
).filter(Boolean) : [];
export const score = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;

