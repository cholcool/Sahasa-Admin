import { z } from 'zod';

/**
 * Order status (client answer Q6). Must match `enum OrderStatus` in
 * apps/api/prisma/schema.prisma — change both together.
 * "Partially shipped" is not a status; it is derived from shipment_items.
 */
export const ORDER_STATUSES = [
  'received', // รับออเดอร์
  'awaiting_confirm', // รอยืนยัน
  'in_production', // ผลิต
  'ready_to_ship', // คีย์ข้อมูลส่ง
  'in_transit', // ระหว่างจัดส่ง
  'delivered', // จัดส่งสำเร็จ
  'cancelled', // ยกเลิก
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const ORDER_STATUS_LABEL_TH: Record<OrderStatus, string> = {
  received: 'รับออเดอร์',
  awaiting_confirm: 'รอยืนยัน',
  in_production: 'ผลิต',
  ready_to_ship: 'คีย์ข้อมูลส่ง',
  in_transit: 'ระหว่างจัดส่ง',
  delivered: 'จัดส่งสำเร็จ',
  cancelled: 'ยกเลิก',
};
