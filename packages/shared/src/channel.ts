import { z } from 'zod';

/** ช่องทางขาย 7 ช่องทาง (SRS Dashboard) */
export const CHANNELS = [
  'shopee',
  'lazada',
  'tiktok',
  'line',
  'facebook',
  'storefront', // หน้าร้าน
  'phone', // โทรสั่ง
] as const;

export const channelSchema = z.enum(CHANNELS);
export type Channel = z.infer<typeof channelSchema>;
