const numberFmt = new Intl.NumberFormat('th-TH');
const moneyFmt = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const money2Fmt = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1234 → "1,234" */
export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

/** Accounting style amount without currency symbol: 2663.55 → "2,663.55", -42.2 → "-42.20" */
export function formatAmount(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? money2Fmt.format(n) : '-';
}

/**
 * Format baht amounts for display. Accepts string because money comes from the API as Decimal strings.
 * 1234.5 → "฿1,234.5", with `{ decimals: true }` → "฿1,234.50", negative → "-฿126"
 */
export function formatBaht(value: number | string, opts: { decimals?: boolean } = {}): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '-';
  const fmt = opts.decimals ? money2Fmt : moneyFmt;
  return `${n < 0 ? '-' : ''}฿${fmt.format(Math.abs(n))}`;
}
