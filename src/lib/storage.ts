import type { Language, Progress, ProblemProgress } from "../types";

const LANGUAGES: readonly Language[] = ["numpy", "pytorch"];

/** Valid per-track saved code, or undefined. Unknown keys are dropped. */
export function sanitizeCodes(value: unknown): ProblemProgress["codes"] {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const pytorch = (value as Record<string, unknown>).pytorch;
  return typeof pytorch === "string" ? { pytorch } : undefined;
}

/** Known languages in canonical order, or undefined when there are none. */
export function sanitizeSolvedIn(value: unknown): Language[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const languages = LANGUAGES.filter((language) => value.includes(language));
  return languages.length ? languages : undefined;
}

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
function withTracks(
  codes: unknown,
  solvedIn: unknown,
): Pick<ProblemProgress, "codes" | "solvedIn"> {
  const validCodes = sanitizeCodes(codes);
  const validSolvedIn = sanitizeSolvedIn(solvedIn);
  return {
    ...(validCodes ? { codes: validCodes } : {}),
    ...(validSolvedIn ? { solvedIn: validSolvedIn } : {}),
  };
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
          ...withTracks(entry.codes, entry.solvedIn),
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
