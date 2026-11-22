import { describe, expect, it } from 'vitest';
import { deliveryRoundFor, parseTime, type CutoffRule } from './cutoff';

// 2026-11-16 is a Monday
const rule: CutoffRule = { cutoffMinutes: 720, offDays: [0] };
const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m);
const day = (d: Date) => d.getDate();

describe('deliveryRoundFor', () => {
  it('สั่งก่อนหรือตรงเวลาตัดรอบ เข้ารอบวันเดียวกัน', () => {
    expect(day(deliveryRoundFor(at(17, 11, 59), rule))).toBe(17);
    expect(day(deliveryRoundFor(at(17, 12, 0), rule))).toBe(17);
  });

  it('สั่งหลังตัดรอบ เข้ารอบวันถัดไป', () => {
    expect(day(deliveryRoundFor(at(17, 12, 1), rule))).toBe(18);
  });

  it('ข้ามวันอาทิตย์ตามตัวอย่างใน prototype', () => {
    // Saturday 21 Nov 12:01 → Monday 23 Nov
    expect(day(deliveryRoundFor(at(21, 12, 1), rule))).toBe(23);
  });

  it('ข้ามวันหยุดพิเศษ', () => {
    const withHoliday = { ...rule, holidays: ['2026-11-18'] };
    expect(day(deliveryRoundFor(at(17, 13), withHoliday))).toBe(19);
  });

  it('แจ้ง error ถ้าตั้งไม่ส่งทุกวัน', () => {
    expect(() =>
      deliveryRoundFor(at(17, 9), { cutoffMinutes: 720, offDays: [0, 1, 2, 3, 4, 5, 6] }),
    ).toThrow('ไม่พบวันส่ง');
  });
});

describe('parseTime', () => {
  it('แปลงเวลาเป็นนาที', () => {
    expect(parseTime('12:00')).toBe(720);
    expect(parseTime('9:30')).toBe(570);
  });

  it('รูปแบบผิดคืน null', () => {
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('noon')).toBeNull();
  });
});
