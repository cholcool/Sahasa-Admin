import { describe, expect, it } from 'vitest';
import { filterOrders } from './filter-orders';
import type { FilterableOrder } from './filter-orders';

const base: FilterableOrder = {
  orderNumber: 'ORD-1',
  channel: 'shopee',
  orderDate: '2026-11-23',
  customerName: 'สมชาย',
  phone: '081-234-5678',
  status: 'pending_review',
};

const orders: FilterableOrder[] = [
  base,
  { ...base, orderNumber: 'ORD-2', channel: 'line', orderDate: '2026-11-23' },
  { ...base, orderNumber: 'ORD-3', channel: 'shopee', orderDate: '2026-11-22' },
  { ...base, orderNumber: 'ORD-4', channel: 'shopee', orderDate: '2026-11-20' },
];

const numbers = (list: FilterableOrder[]) => list.map((o) => o.orderNumber);

describe('filterOrders', () => {
  it('ไม่มี filter ได้ทุกรายการ', () => {
    expect(filterOrders(orders, {})).toHaveLength(4);
  });

  it('กรองช่องทาง + วันที่สั่งวันเดียว (ลิงก์จาก Dashboard)', () => {
    expect(
      numbers(
        filterOrders(orders, {
          channel: 'shopee',
          orderDateFrom: '2026-11-23',
          orderDateTo: '2026-11-23',
        }),
      ),
    ).toEqual(['ORD-1']);
  });

  it('ช่วงวันที่รวมวันแรกและวันสุดท้าย', () => {
    expect(
      numbers(filterOrders(orders, { orderDateFrom: '2026-11-20', orderDateTo: '2026-11-22' })),
    ).toEqual(['ORD-3', 'ORD-4']);
  });

  it('ค้นหาด้วยเบอร์โทรแบบไม่มีขีด', () => {
    expect(filterOrders(orders, { q: '0812345678' })).toHaveLength(4);
  });

  it('ค้นหาด้วยชื่อลูกค้าหรือเลข Order', () => {
    expect(numbers(filterOrders(orders, { q: 'ord-2' }))).toEqual(['ORD-2']);
  });
});
