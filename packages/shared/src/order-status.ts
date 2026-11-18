import { z } from 'zod';

/**
 * สถานะ Order — ร่างจาก SRS 9 + "ส่งไม่ครบ" (SRS 26)
 * ยังไม่ final: รอคำตอบข้อ 6 ใน _requirements/Database-Design-Notes.md
 */
export const ORDER_STATUSES = [
  'pending_review', // รอตรวจสอบ
  'confirmed', // ยืนยันแล้ว
  'factory_accepted', // โรงงานรับแล้ว
  'partially_shipped', // ส่งไม่ครบ
  'shipped', // จัดส่งแล้ว
  'delivered', // จัดส่งสำเร็จ
  'cancelled', // ยกเลิก
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const ORDER_STATUS_LABEL_TH: Record<OrderStatus, string> = {
  pending_review: 'รอตรวจสอบ',
  confirmed: 'ยืนยันแล้ว',
  factory_accepted: 'โรงงานรับแล้ว',
  partially_shipped: 'ส่งไม่ครบ',
  shipped: 'จัดส่งแล้ว',
  delivered: 'จัดส่งสำเร็จ',
  cancelled: 'ยกเลิก',
};
