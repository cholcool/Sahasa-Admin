import { describe, expect, it } from 'vitest';
import { findNavMatch } from './nav-items';

describe('findNavMatch', () => {
  it('หน้าแรกและ dashboard ตาม role อยู่ใต้เมนูแดชบอร์ด', () => {
    expect(findNavMatch('/').item?.to).toBe('/');
    expect(findNavMatch('/dashboard/factory').item?.to).toBe('/');
  });

  it('เลือกเมนูย่อยที่ path ยาวที่สุด', () => {
    const { item, child } = findNavMatch('/orders/new');
    expect(item?.to).toBe('/orders');
    expect(child?.to).toBe('/orders/new');
  });

  it('หน้ารายละเอียดใช้เมนูย่อยหลักของ section', () => {
    expect(findNavMatch('/orders/ORD-000128').child?.to).toBe('/orders');
  });

  it('ไม่สับสน path ที่ขึ้นต้นเหมือนกัน', () => {
    expect(findNavMatch('/master/customers').child?.to).toBe('/master/customers');
    expect(findNavMatch('/unknown').item).toBeUndefined();
  });
});
