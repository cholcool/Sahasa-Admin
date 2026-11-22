import type { Channel } from '@sahasa/shared';

// Display labels kept in web for now; move to packages/shared once confirmed with the team
export const CHANNEL_LABEL_TH: Record<Channel, string> = {
  shopee: 'Shopee',
  lazada: 'Lazada',
  tiktok: 'TikTok',
  line: 'Line',
  facebook: 'Facebook',
  storefront: 'หน้าร้าน',
  phone: 'โทร',
};

/** Channels where staff key in orders by hand (create order page) */
export const MANUAL_CHANNELS = [
  'line',
  'facebook',
  'storefront',
  'phone',
] as const satisfies readonly Channel[];

export type PaymentState = 'platform' | 'awaiting' | 'paid';

export const PAYMENT_STATE: Record<PaymentState, { label: string; color: string }> = {
  platform: { label: 'ผ่าน Platform', color: 'gray' },
  awaiting: { label: 'รอยืนยันรับเงิน', color: 'gold' },
  paid: { label: 'รับเงินแล้ว', color: 'green' },
};

export type DeliveryState = 'none' | 'waiting' | 'in_transit' | 'delivered';

export const DELIVERY_STATE: Record<DeliveryState, { label: string; color: string }> = {
  none: { label: 'ยังไม่จัดส่ง', color: 'gray' },
  waiting: { label: 'รอจัดส่ง', color: 'orange' },
  in_transit: { label: 'กำลังขนส่ง', color: 'blue' },
  delivered: { label: 'ส่งถึงแล้ว', color: 'green' },
};

export const CARRIERS = [
  'Inter Express (หาดใหญ่)',
  'Nim Express (กทม.)',
  'Fuze Express (กทม.)',
  'ส่งจากหน้าร้าน',
  'รถตู้/รถทัวร์',
];

export const CANCEL_REASONS = [
  'ลูกค้าขอยกเลิก',
  'สินค้าหมด / ผลิตไม่ทัน',
  'ที่อยู่ไม่ถูกต้อง / ติดต่อไม่ได้',
  'ชำระเงินไม่สำเร็จ',
  'Order ซ้ำ',
  'อื่นๆ',
];
