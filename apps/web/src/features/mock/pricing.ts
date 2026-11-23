import type { Channel } from '@sahasa/shared';

/**
 * Price and shipping rules from "Project Detail.xlsx › ราคาสินค้า" (sheetRow = row in that sheet).
 * Decisions taken with poom on 2026-11-23 where the sheet is silent:
 * - Line/Facebook/Shopee/TikTok sell tofu from 10 pieces up (10–19 = 35)
 * - หน้าร้าน and โทร use the Line/Facebook prices; หน้าร้าน has no shipping fee
 * - "ค่าส่งน้ำจิ้ม 30" applies to orders with sauce only
 * - "ลูกค้าส่ง NoVat" 23 / 22 are two wholesale customer groups (A / B)
 * - Lazada outside กทม./ภาคใต้ is not in the sheet: assumed 100 like Line/Facebook
 * - Quantities between tiers use the highest tier reached (Shopee 31–39 = 30)
 */

export type Region = 'bkk_south' | 'other';

export const REGION_LABEL: Record<Region, string> = {
  bkk_south: 'กทม. / ภาคใต้',
  other: 'ภาคเหนือ / อีสาน / กลาง',
};

/** Customers with their own tofu price (rows 6–9) */
export const PRICE_GROUPS = {
  franchise: 'บริษัท แฟรนไชส์ สมิทธ์ จำกัด',
  wholesale_a: 'ลูกค้าส่ง NoVat (กลุ่ม A)',
  wholesale_b: 'ลูกค้าส่ง NoVat (กลุ่ม B)',
  jfb: 'บริษัท เจเอฟบี คิทเช่น จำกัด (ชิ้นย่อย)',
} as const;

export type PriceGroup = keyof typeof PRICE_GROUPS;

export const PRICE_GROUP_IDS = Object.keys(PRICE_GROUPS).filter(
  (k): k is PriceGroup => k in PRICE_GROUPS,
);

export interface PriceRule {
  id: string;
  sheetRow: number;
  productId: string;
  /** Text of the "เงื่อนไข" column */
  condition: string;
  /** null = every channel */
  channels: Channel[] | null;
  minQty: number;
  priceGroup: PriceGroup | null;
  price: number;
}

export interface ShippingRule {
  id: string;
  sheetRow: number;
  condition: string;
  channels: Channel[] | null;
  region: Region | null;
  sauceOnly: boolean;
  fee: number;
}

export const TOFU_ID = 'PRD-001';
export const SAUCE_ID = 'PRD-002';

const LINE_LIKE: Channel[] = ['line', 'facebook', 'phone', 'storefront'];

export const DEFAULT_PRICE_RULES: PriceRule[] = [
  {
    id: 'P2',
    sheetRow: 2,
    productId: TOFU_ID,
    condition: 'ราคาต่อชิ้น ช่องทางLazada',
    channels: ['lazada'],
    minQty: 1,
    priceGroup: null,
    price: 45,
  },
  {
    id: 'P3',
    sheetRow: 3,
    productId: TOFU_ID,
    condition: 'ราคาเมื่อสั่ง 10 ชิ้น (ช่องทางLine ,Facebook ,Shopee ,Tiktok )',
    channels: [...LINE_LIKE, 'shopee', 'tiktok'],
    minQty: 10,
    priceGroup: null,
    price: 35,
  },
  {
    id: 'P4',
    sheetRow: 4,
    productId: TOFU_ID,
    condition: 'ราคาเมื่อสั่ง 20-30 ชิ้น (ช่องทางShopee)',
    channels: ['shopee'],
    minQty: 20,
    priceGroup: null,
    price: 30,
  },
  {
    id: 'P5a',
    sheetRow: 5,
    productId: TOFU_ID,
    condition: 'ราคาเมื่อสั่ง 20-30 ชิ้น (ช่องทางLine ,Facebook )',
    channels: LINE_LIKE,
    minQty: 20,
    priceGroup: null,
    price: 28,
  },
  {
    id: 'P5b',
    sheetRow: 5,
    productId: TOFU_ID,
    condition: 'ราคาเมื่อสั่ง 40 ชิ้น ขึ้นไป (ช่องทาง Shopee)',
    channels: ['shopee'],
    minQty: 40,
    priceGroup: null,
    price: 28,
  },
  {
    id: 'P6',
    sheetRow: 6,
    productId: TOFU_ID,
    condition: 'ราคาเมื่อสั่ง 40 ชิ้น ขึ้นไป (ช่องทางLine ,Facebook )',
    channels: LINE_LIKE,
    minQty: 40,
    priceGroup: null,
    price: 25,
  },
  {
    id: 'P7',
    sheetRow: 7,
    productId: TOFU_ID,
    condition: 'ราคากับ บริษัท แฟรนไชส์ สมิทธ์ จำกัด',
    channels: null,
    minQty: 1,
    priceGroup: 'franchise',
    price: 24,
  },
  {
    id: 'P8',
    sheetRow: 8,
    productId: TOFU_ID,
    condition: 'ราคาลูกค้าส่ง NoVat (กลุ่ม A)',
    channels: null,
    minQty: 1,
    priceGroup: 'wholesale_a',
    price: 23,
  },
  {
    id: 'P9',
    sheetRow: 9,
    productId: TOFU_ID,
    condition: 'ราคาลูกค้าส่ง NoVat (กลุ่ม B)',
    channels: null,
    minQty: 1,
    priceGroup: 'wholesale_b',
    price: 22,
  },
  {
    id: 'P10',
    sheetRow: 10,
    productId: TOFU_ID,
    condition: 'ราคาของ บริษัท เจเอฟบี คิทเช่น จำกัด (เป็นแบบชิ้นย่อย)',
    channels: null,
    minQty: 1,
    priceGroup: 'jfb',
    price: 16,
  },
  {
    id: 'P11',
    sheetRow: 11,
    productId: SAUCE_ID,
    condition: 'แบบชุด หรือ แบบกิโลกรัม',
    channels: null,
    minQty: 1,
    priceGroup: null,
    price: 75,
  },
];

export const DEFAULT_SHIPPING_RULES: ShippingRule[] = [
  {
    id: 'S12',
    sheetRow: 12,
    condition: 'ค่าส่งน้ำจิ้ม (สั่งน้ำจิ้มอย่างเดียว)',
    channels: null,
    region: null,
    sauceOnly: true,
    fee: 30,
  },
  {
    id: 'S13',
    sheetRow: 13,
    condition: 'ค่าส่ง กทม. ภาคใต้  (ช่องทางLine ,Facebook , Lazada )',
    channels: ['line', 'facebook', 'phone', 'lazada'],
    region: 'bkk_south',
    sauceOnly: false,
    fee: 50,
  },
  {
    id: 'S14',
    sheetRow: 14,
    condition: 'ค่าส่ง ภาคเหนือ/ อีสาน/ กลาง (ช่องทางLine ,Facebook )',
    channels: ['line', 'facebook', 'phone', 'lazada'],
    region: 'other',
    sauceOnly: false,
    fee: 100,
  },
  {
    id: 'S15',
    sheetRow: 15,
    condition: 'ค่าขนส่ง (ช่องทาง Shopee ,Tiktok )',
    channels: ['shopee', 'tiktok'],
    region: null,
    sauceOnly: false,
    fee: 150,
  },
];

/** Lowest quantity a channel can order (10 for Line/Facebook/Shopee/TikTok tofu) */
export function minOrderQty(rules: PriceRule[], productId: string, channel: Channel): number {
  const list = rules.filter(
    (r) =>
      r.productId === productId && !r.priceGroup && (!r.channels || r.channels.includes(channel)),
  );
  return list.length ? Math.min(...list.map((r) => r.minQty)) : 1;
}

/** Unit price for a quantity; customer price groups win over channel tiers */
export function unitPrice(
  rules: PriceRule[],
  productId: string,
  channel: Channel,
  qty: number,
  priceGroup?: PriceGroup | null,
  fallback = 0,
): number {
  if (priceGroup) {
    const own = rules.find((r) => r.productId === productId && r.priceGroup === priceGroup);
    if (own) return own.price;
  }
  const list = rules
    .filter(
      (r) =>
        r.productId === productId && !r.priceGroup && (!r.channels || r.channels.includes(channel)),
    )
    .toSorted((a, b) => a.minQty - b.minQty);
  if (list.length === 0) return fallback;
  const reached = list.filter((r) => r.minQty <= qty).at(-1);
  // Below the minimum quantity: show the first tier's price
  return (reached ?? list[0])?.price ?? fallback;
}

const BKK_SOUTH = [
  'กรุงเทพ',
  'สงขลา',
  'ภูเก็ต',
  'นครศรีธรรมราช',
  'สุราษฎร์ธานี',
  'ตรัง',
  'พัทลุง',
  'ยะลา',
  'ปัตตานี',
  'นราธิวาส',
  'สตูล',
  'กระบี่',
  'พังงา',
  'ระนอง',
  'ชุมพร',
];

export function regionOf(address: string): Region {
  return BKK_SOUTH.some((p) => address.includes(p)) ? 'bkk_south' : 'other';
}

export interface ShippingInput {
  channel: Channel;
  /** Pick-up at the shop never pays shipping */
  pickUp: boolean;
  address: string;
  productIds: string[];
}

/** Shipping fee charged to the customer, and the rule that set it */
export function shippingFee(
  rules: ShippingRule[],
  input: ShippingInput,
): { fee: number; rule?: ShippingRule } {
  if (input.pickUp || input.channel === 'storefront') return { fee: 0 };
  const sauceOnly = input.productIds.length > 0 && input.productIds.every((id) => id === SAUCE_ID);
  const region = regionOf(input.address);
  const rule = rules.find(
    (r) =>
      r.sauceOnly === sauceOnly &&
      (!r.channels || r.channels.includes(input.channel)) &&
      (!r.region || r.region === region),
  );
  return { fee: rule?.fee ?? 0, rule };
}
