import type { Progress, ProblemProgress } from "../types";

export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function readProgress(): Progress {
  try {
    const raw = readStorage("ml-interview-progress");
    // Keep the exact pre-upgrade payload, including malformed entries, before
    // the defensive reader normalizes it. This backup is local to this browser.
    if (raw && !readStorage("ml-interview-progress-backup-v1")) {
      writeStorage("ml-interview-progress-backup-v1", raw);
    }
    const value: unknown = JSON.parse(raw ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const progress: Progress = {};
    for (const [section, entries] of Object.entries(value)) {
      if (!entries || typeof entries !== "object" || Array.isArray(entries))
        continue;
      const valid: Record<string, ProblemProgress> = Object.create(null);
      for (const [id, raw] of Object.entries(entries)) {
        if (!raw || typeof raw !== "object") continue;
        const entry = raw as Record<string, unknown>;
        if (
          typeof entry.status !== "string" ||
          !["not_started", "in_progress", "completed"].includes(entry.status)
        )
          continue;
        valid[id] = {
          status: entry.status as ProblemProgress["status"],
          ...(typeof entry.code === "string" ? { code: entry.code } : {}),
          ...(typeof entry.lastAttempt === "string"
            ? { lastAttempt: entry.lastAttempt }
            : {}),
        };
      }
      Object.defineProperty(progress, section, {
        value: valid,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return progress;
  } catch {
    return {};
  }
}
