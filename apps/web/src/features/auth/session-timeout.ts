/**
 * Auto-logout timing (SRS 1). Durations are still pending client confirmation
 * (marked "รอยืนยัน" in the prototype) — adjust here once agreed.
 */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
/** How long the warning countdown runs before logging out */
export const WARNING_SECONDS = 60;

/** 59 → "00:59", 125 → "02:05" */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
