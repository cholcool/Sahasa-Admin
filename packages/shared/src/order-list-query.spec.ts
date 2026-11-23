import { orderListQuerySchema } from './order-list-query.js';

describe('orderListQuerySchema', () => {
  it('ใส่ค่า default เมื่อไม่มี filter', () => {
    expect(orderListQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 50,
      sort: 'createdAt',
      order: 'desc',
    });
  });

  it('แปลงเลขหน้าจาก string ใน URL', () => {
    expect(orderListQuerySchema.parse({ page: '3' }).page).toBe(3);
  });

  it('รับช่วงวันที่สั่งรูปแบบ YYYY-MM-DD', () => {
    const q = orderListQuerySchema.parse({
      channel: 'shopee',
      orderDateFrom: '2026-11-23',
      orderDateTo: '2026-11-23',
    });
    expect(q).toMatchObject({
      channel: 'shopee',
      orderDateFrom: '2026-11-23',
      orderDateTo: '2026-11-23',
    });
  });

  it('ไม่รับวันที่สั่งผิดรูปแบบ', () => {
    expect(orderListQuerySchema.safeParse({ orderDateFrom: '23/11/2026' }).success).toBe(false);
  });

  it('ไม่รับสถานะที่ไม่มีในระบบ', () => {
    expect(orderListQuerySchema.safeParse({ status: 'lost' }).success).toBe(false);
  });
});
