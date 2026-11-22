import { describe, expect, it } from 'vitest';
import { formatAmount, formatBaht, formatNumber } from './format';

describe('formatNumber', () => {
  it('ใส่ comma คั่นหลักพัน', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatAmount', () => {
  it('แสดงทศนิยม 2 ตำแหน่งไม่มีสัญลักษณ์บาท', () => {
    expect(formatAmount(2663.55)).toBe('2,663.55');
    expect(formatAmount(-42.2)).toBe('-42.20');
    expect(formatAmount('190')).toBe('190.00');
  });
});

describe('formatBaht', () => {
  it('แสดงสัญลักษณ์บาทและ comma', () => {
    expect(formatBaht(58940)).toBe('฿58,940');
  });

  it('ยอดติดลบมีเครื่องหมายหน้า ฿', () => {
    expect(formatBaht(-126)).toBe('-฿126');
  });

  it('รับ string จาก Decimal ของ API และบังคับทศนิยม 2 ตำแหน่งได้', () => {
    expect(formatBaht('1234.5', { decimals: true })).toBe('฿1,234.50');
  });

  it('ค่าที่ไม่ใช่ตัวเลขแสดงเป็นขีด', () => {
    expect(formatBaht('abc')).toBe('-');
  });
});
