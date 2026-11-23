import { z } from 'zod';
import { channelSchema } from './channel.js';
import { orderStatusSchema } from './order-status.js';

/**
 * Filter ของหน้ารายการ Order
 * ใช้ร่วมกัน 2 ที่: TanStack Router `validateSearch` (URL) และ NestJS query DTO (API)
 */
export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(200).default(50),
  q: z.string().trim().max(100).optional(),
  status: orderStatusSchema.optional(),
  channel: channelSchema.optional(),
  /** วันที่สั่ง (order_date) รูปแบบ YYYY-MM-DD (เวลาไทย) */
  orderDateFrom: z.iso.date().optional(),
  orderDateTo: z.iso.date().optional(),
  /** วันที่จัดส่ง รูปแบบ YYYY-MM-DD (เวลาไทย) */
  shipDateFrom: z.iso.date().optional(),
  shipDateTo: z.iso.date().optional(),
  sort: z.enum(['createdAt', 'shipDate', 'orderNumber']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
