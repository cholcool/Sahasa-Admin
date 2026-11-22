export const VAT_RATE_PERCENT = 7;

/**
 * Split a VAT-inclusive amount into base + VAT (prices in the prototype include VAT).
 * Whether prices include or exclude VAT is still pending (Q18).
 * Calculated in satang so 2,850.00 → 2,663.55 + 186.45 exactly.
 */
export function splitVat(totalInclVat: number, ratePercent = VAT_RATE_PERCENT) {
  const totalSatang = Math.round(totalInclVat * 100);
  const baseSatang = Math.round((totalSatang * 100) / (100 + ratePercent));
  return {
    base: baseSatang / 100,
    vat: (totalSatang - baseSatang) / 100,
    total: totalSatang / 100,
  };
}

const DIGITS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const POSITIONS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

/** Read an integer below one million in Thai (helper for thaiBahtText) */
function readUnderMillion(n: number): string {
  const digits = String(n).split('').map(Number);
  return digits
    .map((d, i) => {
      const pos = digits.length - 1 - i;
      if (d === 0) return '';
      if (pos === 0 && d === 1 && digits.length > 1) return 'เอ็ด';
      if (pos === 1 && d === 1) return 'สิบ';
      if (pos === 1 && d === 2) return 'ยี่สิบ';
      return (DIGITS[d] ?? '') + (POSITIONS[pos] ?? '');
    })
    .join('');
}

function readInteger(n: number): string {
  if (n === 0) return 'ศูนย์';
  const millions = Math.floor(n / 1_000_000);
  const rest = n % 1_000_000;
  return (
    (millions > 0 ? `${readInteger(millions)}ล้าน` : '') + (rest > 0 ? readUnderMillion(rest) : '')
  );
}

/** 2850 → "สองพันแปดร้อยห้าสิบบาทถ้วน", 21.5 → "ยี่สิบเอ็ดบาทห้าสิบสตางค์" (for printed invoices) */
export function thaiBahtText(amount: number): string {
  const satang = Math.round(Math.abs(amount) * 100);
  const baht = Math.floor(satang / 100);
  const st = satang % 100;
  const bahtText = baht > 0 || st === 0 ? `${readInteger(baht)}บาท` : '';
  return bahtText + (st === 0 ? 'ถ้วน' : `${readInteger(st)}สตางค์`);
}
