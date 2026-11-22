/**
 * Delivery round calculation for the cut-off settings preview (SRS 56).
 * The real rule runs on the API; this mirrors it for the UI preview.
 */
export interface CutoffRule {
  /** Minutes after midnight, e.g. 12:00 → 720 */
  cutoffMinutes: number;
  /** Days with no delivery, 0 = Sunday … 6 = Saturday */
  offDays: number[];
  /** Specific holidays as YYYY-MM-DD (local time) */
  holidays?: string[];
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Returns the date of the round an order placed at `orderedAt` goes into.
 * Orders at or before the cut-off join today's round; later ones roll to the next delivery day.
 */
export function deliveryRoundFor(orderedAt: Date, rule: CutoffRule): Date {
  const minutes = orderedAt.getHours() * 60 + orderedAt.getMinutes();
  const day = new Date(orderedAt.getFullYear(), orderedAt.getMonth(), orderedAt.getDate());
  if (minutes > rule.cutoffMinutes) day.setDate(day.getDate() + 1);
  // Skip non-delivery days and holidays (bounded to avoid an infinite loop on bad config)
  for (let i = 0; i < 14; i++) {
    if (!rule.offDays.includes(day.getDay()) && !rule.holidays?.includes(ymd(day))) return day;
    day.setDate(day.getDate() + 1);
  }
  throw new Error('ไม่พบวันส่งภายใน 14 วัน ตรวจการตั้งค่าวันที่ไม่ส่งสินค้า');
}

/** "12:00" → 720; returns null for invalid input */
export function parseTime(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}
