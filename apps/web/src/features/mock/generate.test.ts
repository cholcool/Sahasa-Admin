import { describe, expect, it } from 'vitest';
import { clearTransactions, DEFAULT_SETTINGS, diffDays, generateMockDb } from './generate';

const TODAY = '2026-11-23';
const db = generateMockDb(DEFAULT_SETTINGS, TODAY);

describe('generateMockDb', () => {
  it('seed เดียวกันได้ข้อมูลชุดเดียวกัน', () => {
    const again = generateMockDb(DEFAULT_SETTINGS, TODAY);
    expect(again.orders).toEqual(db.orders);
    expect(again.documents).toEqual(db.documents);
  });

  it('seed ต่างกันได้ข้อมูลต่างกัน', () => {
    const other = generateMockDb({ ...DEFAULT_SETTINGS, seed: 123456 }, TODAY);
    expect(other.orders.map((o) => o.total)).not.toEqual(db.orders.map((o) => o.total));
  });

  it('มี Order ทุกวันที่ 1–30 พ.ย. วันละ 15–40 รายการ', () => {
    for (let day = 1; day <= 30; day++) {
      const date = `2026-11-${String(day).padStart(2, '0')}`;
      const count = db.orders.filter((o) => o.orderDate === date).length;
      expect(count).toBeGreaterThanOrEqual(15);
      expect(count).toBeLessThanOrEqual(40);
    }
    expect(db.orders.every((o) => o.orderDate >= '2026-11-01' && o.orderDate <= '2026-11-30')).toBe(
      true,
    );
  });

  it('เลข Order ไม่ซ้ำและเรียงตามเวลาสั่ง', () => {
    const numbers = db.orders.map((o) => o.orderNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
    const times = db.orders.map((o) => o.orderedAt);
    expect([...times].toSorted()).toEqual(times);
  });

  it('ยอดรวม = ราคา × จำนวน + ค่าส่ง', () => {
    for (const o of db.orders) {
      const items = o.lines.reduce((s, l) => s + l.qty * l.price, 0);
      expect(o.total).toBe(items + o.shippingFee);
    }
  });

  it('สถานะสอดคล้องกับรอบส่ง: รอบในอนาคตยังไม่ส่ง, รอบเก่ากว่า 2 วันส่งแล้วหรือยกเลิก', () => {
    const future = new Set(
      db.orders.filter((o) => diffDays(o.roundDate, TODAY) > 0).map((o) => o.status),
    );
    const old = new Set(
      db.orders.filter((o) => diffDays(o.roundDate, TODAY) <= -3).map((o) => o.status),
    );
    expect([...future].every((s) => ['pending_review', 'confirmed', 'cancelled'].includes(s))).toBe(
      true,
    );
    expect(
      [...old].every((s) => ['delivered', 'shipped', 'partially_shipped', 'cancelled'].includes(s)),
    ).toBe(true);
    expect(future.size).toBeGreaterThan(0);
    expect(old.size).toBeGreaterThan(0);
  });

  it('Order ที่จัดส่งแล้วมีเลข Tracking และ Order ยกเลิกมีเหตุผล', () => {
    const shipped = db.orders.filter((o) =>
      ['shipped', 'delivered', 'partially_shipped'].includes(o.status),
    );
    const cancelled = db.orders.filter((o) => o.status === 'cancelled');
    expect(shipped.every((o) => Boolean(o.tracking))).toBe(true);
    expect(cancelled.every((o) => Boolean(o.cancelReason))).toBe(true);
    expect(cancelled.length).toBeGreaterThan(0);
  });

  it('Marketplace จ่ายผ่าน Platform ส่วนช่องทาง Manual ไม่ใช่', () => {
    for (const o of db.orders) {
      const marketplace = ['shopee', 'lazada', 'tiktok'].includes(o.channel);
      expect(o.payment === 'platform').toBe(marketplace);
    }
  });

  it('ออกเอกสารบัญชีเลขไม่ซ้ำ และอ้างอิง Order ที่มีอยู่จริง', () => {
    const nos = db.documents.map((d) => d.no);
    expect(new Set(nos).size).toBe(nos.length);
    const orderNumbers = new Set(db.orders.map((o) => o.orderNumber));
    expect(db.documents.every((d) => orderNumbers.has(d.orderNumber))).toBe(true);
    expect(db.documents.length).toBeGreaterThan(0);
  });

  it('ล้างข้อมูลแล้วเหลือข้อมูลหลัก', () => {
    const cleared = clearTransactions(db);
    expect(cleared.orders).toHaveLength(0);
    expect(cleared.documents).toHaveLength(0);
    expect(cleared.products.length).toBeGreaterThan(0);
    expect(cleared.customers.length).toBeGreaterThan(0);
    expect(cleared.cleared).toBe(true);
  });
});
