import type { Channel } from '@sahasa/shared';
import type { PriceGroup } from './pricing';
import type { MockCarrier, MockProduct, MockUser } from './types';

// Fixed master data and word pools for the mock generator (all fictional)

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'PRD-001',
    name: 'เต้าหู้คลองแงะ',
    shortName: 'เต้าหู้',
    kind: 'tofu',
    unit: 'ชิ้น',
    basePrice: 45,
    active: true,
  },
  {
    id: 'PRD-002',
    name: 'น้ำจิ้มมะขามน้ำตาลโตนด',
    shortName: 'น้ำจิ้ม',
    kind: 'sauce',
    unit: 'ชุด',
    basePrice: 75,
    active: true,
  },
];

export const MOCK_CARRIERS: MockCarrier[] = [
  {
    id: 'inter',
    name: 'Inter Express',
    fullName: 'Inter Express (หาดใหญ่)',
    hasApi: true,
    trackingPrefix: 'IE',
  },
  {
    id: 'nim',
    name: 'Nim Express',
    fullName: 'Nim Express (กทม.)',
    hasApi: true,
    trackingPrefix: 'NM',
  },
  {
    id: 'fuze',
    name: 'Fuze Express',
    fullName: 'Fuze Express (กทม.)',
    hasApi: true,
    trackingPrefix: 'FZ',
  },
  {
    id: 'store',
    name: 'ส่งจากหน้าร้าน',
    fullName: 'ส่งจากหน้าร้าน',
    hasApi: false,
    trackingPrefix: 'ST-',
  },
  { id: 'van', name: 'รถตู้/รถทัวร์', fullName: 'รถตู้/รถทัวร์', hasApi: false, trackingPrefix: 'VAN-' },
];

export const MOCK_USERS: MockUser[] = [
  { id: 'U01', username: 'admin', name: 'ผู้ดูแลระบบ', role: 'Admin', active: true },
  { id: 'U02', username: 'sales01', name: 'นภา ขายดี', role: 'Sales', active: true },
  { id: 'U03', username: 'sales02', name: 'ก้อง ใจเย็น', role: 'Sales', active: true },
  { id: 'U04', username: 'head01', name: 'สมศรี หัวหน้า', role: 'หัวหน้า', active: true },
  { id: 'U05', username: 'factory01', name: 'ชัยวัฒน์ โรงงาน', role: 'Factory', active: true },
  { id: 'U06', username: 'factory02', name: 'บุญมี แพ็คของ', role: 'Factory', active: true },
  { id: 'U07', username: 'acc01', name: 'อรุณี บัญชี', role: 'Accounting', active: true },
  { id: 'U08', username: 'sales03', name: 'ปิยะ ลาออก', role: 'Sales', active: false },
];

export const MARKETPLACE_CHANNELS = ['shopee', 'lazada', 'tiktok'] as const satisfies Channel[];

export function isMarketplace(channel: Channel): boolean {
  return (MARKETPLACE_CHANNELS as readonly Channel[]).includes(channel);
}

/** Share of daily orders per channel */
export const CHANNEL_WEIGHTS: Record<Channel, number> = {
  shopee: 30,
  tiktok: 18,
  lazada: 10,
  line: 17,
  facebook: 9,
  storefront: 9,
  phone: 7,
};

export const FIRST_NAMES = [
  'สมชาย',
  'สมหญิง',
  'วิภา',
  'ธนพล',
  'อรทัย',
  'กิตติ',
  'มาลี',
  'ประเสริฐ',
  'สุดา',
  'วีระ',
  'จันทร์เพ็ญ',
  'ณัฐวุฒิ',
  'ปวีณา',
  'อนุชา',
  'รัตนา',
  'ชลธิชา',
  'ศุภชัย',
  'พิมพ์ชนก',
  'เอกชัย',
  'กนกวรรณ',
  'ธีรพงษ์',
  'นันทนา',
  'สุรเชษฐ์',
  'ดวงใจ',
  'วรวุฒิ',
  'อัมพร',
  'ภานุวัฒน์',
  'ศิริพร',
  'ไพโรจน์',
  'ลัดดา',
];

export const LAST_INITIALS = [
  'ก.',
  'ข.',
  'จ.',
  'ช.',
  'ด.',
  'ต.',
  'ท.',
  'น.',
  'บ.',
  'ป.',
  'พ.',
  'ม.',
  'ร.',
  'ล.',
  'ว.',
  'ส.',
  'อ.',
];

export const SHOP_NAMES = [
  'ร้านเจ๊หมวย',
  'ครัวป้าศรี',
  'บจก. สยามฟู้ด',
  'ร้านข้าวต้มโต้รุ่ง',
  'หจก. หาดใหญ่ซีฟู้ด',
  'ร้านสุกี้ลุงโต',
  'คุณนิด',
  'ร้านก๋วยเตี๋ยวเรือป้าแดง',
  'บจก. ใต้ฟ้าเทรดดิ้ง',
  'ร้านอาหารบ้านสวน',
  'ร้านหมูกระทะพี่ต้น',
  'ครัวคุณยาย',
  'ร้านโจ๊กสามแยก',
  'บจก. ทักษิณฟู้ดส์',
  'ร้านชาบูน้องเมย์',
  'ร้านเย็นตาโฟเจ๊กุ้ง',
  'คุณต้น',
  'ร้านอาหารเจรุ่งเรือง',
  'มินิมาร์ทบ้านพรุ',
  'ร้านป้าจิ๋ว',
  'บจก. สงขลาโฮลเซล',
  'ร้านข้าวมันไก่ตาโต',
  'บริษัท แฟรนไชส์ สมิทธ์ จำกัด',
  'บริษัท เจเอฟบี คิทเช่น จำกัด',
];

/** Shops with their own tofu price (Project Detail › ราคาสินค้า rows 6–9) */
export const SHOP_PRICE_GROUPS: Record<string, PriceGroup> = {
  'บริษัท แฟรนไชส์ สมิทธ์ จำกัด': 'franchise',
  'บริษัท เจเอฟบี คิทเช่น จำกัด': 'jfb',
  ร้านเจ๊หมวย: 'wholesale_a',
  ร้านข้าวต้มโต้รุ่ง: 'wholesale_a',
  ร้านก๋วยเตี๋ยวเรือป้าแดง: 'wholesale_b',
  มินิมาร์ทบ้านพรุ: 'wholesale_b',
};

export const ROADS = [
  'ถ.เพชรเกษม',
  'ถ.นิพัทธ์อุทิศ 3',
  'ถ.ศรีภูวนารถ',
  'ถ.ราษฎร์อุทิศ',
  'ถ.กาญจนวนิช',
  'ถ.ลพบุรีราเมศวร์',
  'ถ.สุขุมวิท',
  'ถ.พหลโยธิน',
  'ถ.รัชดาภิเษก',
  'ถ.ลาดพร้าว',
];

export const AREAS = [
  'ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
  'ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110',
  'ต.คลองแห อ.หาดใหญ่ จ.สงขลา 90110',
  'ต.บ่อยาง อ.เมือง จ.สงขลา 90000',
  'ต.ตลาดใหญ่ อ.เมือง จ.ภูเก็ต 83000',
  'ต.ในเมือง อ.เมือง จ.นครศรีธรรมราช 80000',
  'ต.ตลาด อ.เมือง จ.สุราษฎร์ธานี 84000',
  'แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
  'แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
  'แขวงบางนา เขตบางนา กรุงเทพฯ 10260',
  'ต.บางกระสอ อ.เมือง จ.นนทบุรี 11000',
  'ต.ช้างเผือก อ.เมือง จ.เชียงใหม่ 50300',
  'ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
  'ต.ในเมือง อ.เมือง จ.นครราชสีมา 30000',
  'ต.ประตูชัย อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา 13000',
];

/** Areas reachable by van/bus (southern provinces) */
export const SOUTH_AREA_COUNT = 7;

export const CANCEL_REASONS_MOCK = [
  'ลูกค้าขอยกเลิก',
  'ลูกค้าขอยกเลิก',
  'ชำระเงินไม่สำเร็จ',
  'ที่อยู่ไม่ถูกต้อง / ติดต่อไม่ได้',
  'Order ซ้ำ',
  'สินค้าหมด / ผลิตไม่ทัน',
];

export const PLATFORM_OF: Partial<Record<Channel, 'Shopee' | 'Lazada' | 'TikTok Shop'>> = {
  shopee: 'Shopee',
  lazada: 'Lazada',
  tiktok: 'TikTok Shop',
};

/** Marketplace commission rates used for payout reconciliation (mock) */
export const PLATFORM_FEE_RATE: Partial<Record<Channel, number>> = {
  shopee: 0.06,
  lazada: 0.065,
  tiktok: 0.05,
};
