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

  it('ไม่รับสถานะที่ไม่มีในระบบ', () => {
    expect(orderListQuerySchema.safeParse({ status: 'lost' }).success).toBe(false);
  });
});
