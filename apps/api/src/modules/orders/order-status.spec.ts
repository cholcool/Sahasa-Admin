import { ORDER_STATUSES } from '@sahasa/shared';

import { OrderStatus } from '#src/generated/prisma/enums.js';

describe('OrderStatus', () => {
  it('สถานะใน packages/shared ตรงกับ enum ใน schema.prisma ทั้งค่าและลำดับ', () => {
    expect([...ORDER_STATUSES]).toEqual(Object.values(OrderStatus));
  });
});
