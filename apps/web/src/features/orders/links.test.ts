import { describe, expect, it } from 'vitest';
import { todayIso } from '@/lib/dayjs';
import { ordersByChannelOnDateSearch } from './links';

describe('todayIso', () => {
  it('ใช้วันที่ตามเวลาไทย (UTC+7) ไม่ใช่ UTC', () => {
    // 2026-11-23 18:30 UTC = 2026-11-24 01:30 Bangkok
    expect(todayIso(new Date('2026-11-23T18:30:00Z'))).toBe('2026-11-24');
    expect(todayIso(new Date('2026-11-23T16:59:00Z'))).toBe('2026-11-23');
  });
});

describe('ordersByChannelOnDateSearch', () => {
  it('กรองช่องทางและวันที่สั่งวันเดียว', () => {
    expect(ordersByChannelOnDateSearch('shopee', '2026-11-23')).toEqual({
      channel: 'shopee',
      orderDateFrom: '2026-11-23',
      orderDateTo: '2026-11-23',
    });
  });

  it('ค่าเริ่มต้นเป็นวันนี้', () => {
    const today = todayIso();
    expect(ordersByChannelOnDateSearch('line')).toMatchObject({
      orderDateFrom: today,
      orderDateTo: today,
    });
  });
});
