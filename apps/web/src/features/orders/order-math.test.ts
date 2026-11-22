import { describe, expect, it } from 'vitest';
import { lineTotal, orderTotals } from './order-math';

describe('lineTotal', () => {
  it('คูณจำนวนกับราคาต่อหน่วย', () => {
    expect(lineTotal({ qty: 5, price: 190 })).toBe(950);
  });

  it('ไม่มีปัญหาทศนิยมของ float', () => {
    expect(lineTotal({ qty: 3, price: 0.1 })).toBe(0.3);
  });

  it('จำนวนติดลบนับเป็นศูนย์', () => {
    expect(lineTotal({ qty: -2, price: 100 })).toBe(0);
  });
});

describe('orderTotals', () => {
  it('รวมยอดสินค้าและค่าส่งตาม prototype', () => {
    const totals = orderTotals(
      [
        { qty: 5, price: 190 },
        { qty: 2, price: 125 },
      ],
      50,
    );
    expect(totals).toEqual({ items: 1200, shipping: 50, total: 1250 });
  });

  it('ไม่มีสินค้าได้ยอดเป็นค่าส่งอย่างเดียว', () => {
    expect(orderTotals([], 50).total).toBe(50);
  });
});
