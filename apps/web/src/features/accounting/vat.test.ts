import { describe, expect, it } from 'vitest';
import { splitVat, thaiBahtText } from './vat';

describe('splitVat', () => {
  it('แยก VAT 7% จากยอดรวมตาม prototype', () => {
    expect(splitVat(2850)).toEqual({ base: 2663.55, vat: 186.45, total: 2850 });
    expect(splitVat(570)).toEqual({ base: 532.71, vat: 37.29, total: 570 });
  });

  it('ฐาน + VAT เท่ากับยอดรวมเสมอ', () => {
    const { base, vat } = splitVat(950);
    expect(Math.round((base + vat) * 100)).toBe(95000);
  });
});

describe('thaiBahtText', () => {
  it('อ่านจำนวนเงินเต็มบาท', () => {
    expect(thaiBahtText(2850)).toBe('สองพันแปดร้อยห้าสิบบาทถ้วน');
  });

  it('ใช้ "เอ็ด" และ "ยี่สิบ" ถูกต้อง', () => {
    expect(thaiBahtText(21)).toBe('ยี่สิบเอ็ดบาทถ้วน');
    expect(thaiBahtText(11)).toBe('สิบเอ็ดบาทถ้วน');
    expect(thaiBahtText(1)).toBe('หนึ่งบาทถ้วน');
  });

  it('มีสตางค์', () => {
    expect(thaiBahtText(21.5)).toBe('ยี่สิบเอ็ดบาทห้าสิบสตางค์');
    expect(thaiBahtText(0.25)).toBe('ยี่สิบห้าสตางค์');
  });

  it('หลักล้าน', () => {
    expect(thaiBahtText(1_250_000)).toBe('หนึ่งล้านสองแสนห้าหมื่นบาทถ้วน');
  });
});
