// Funnel events deliberately exclude editor contents, test data, identity and
// arbitrary query strings. Existing GA4 performs aggregation and attribution.
import { readStorage, writeStorage } from "./storage";
type Event =
  | "exercise_opened"
  | "code_run"
  | "exercise_passed"
  | "first_run"
  | "first_pass"
  | "return_visit"
  | "path_opened"
  | "challenge_shared";
export function track(
  event: Event,
  params: {
    problem_id?: string;
    section_id?: string;
    path_id?: string;
    source?: string;
  } = {},
) {
  if (import.meta.env.DEV || typeof window === "undefined") return;
  if (
    navigator.doNotTrack === "1" ||
    readStorage("mlgrind-analytics-disabled") === "true"
  )
    return;
  window.gtag?.("event", event, params);
}
export function trackOnce(
  event: "first_run" | "first_pass",
  params: { problem_id: string; section_id: string },
) {
  const key = `mlgrind-${event}`;
  if (readStorage(key)) return;
  writeStorage(key, "true");
  track(event, params);
}
export function trackVisit() {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const previous = readStorage("mlgrind-last-visit");
  if (previous && previous !== today) track("return_visit");
  writeStorage("mlgrind-last-visit", today);
}
