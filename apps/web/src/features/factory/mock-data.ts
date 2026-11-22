import type { OrderStatus } from '@sahasa/shared';

// Sample data copied from UI Prototype/pages/04-xx — TODO: replace with the factory API

export const CARRIER_TABS = [
  { value: 'inter', label: 'Inter Express', count: 18 },
  { value: 'nim', label: 'Nim Express', count: 12 },
  { value: 'fuze', label: 'Fuze Express', count: 8 },
  { value: 'store', label: 'ส่งจากหน้าร้าน', count: 5 },
  { value: 'van', label: 'รถตู้/รถทัวร์', count: 3 },
];

export interface QueueRow {
  orderNumber: string;
  channel: string;
  customer: string;
  items: string;
  carrier: string;
  carrierKey: string;
  status: OrderStatus;
  note?: 'inserted' | 'edited';
}

export const QUEUE_ROWS: QueueRow[] = [
  {
    orderNumber: 'ORD-000142',
    channel: 'Shopee',
    customer: 'สมชาย ใจดี',
    items: 'เต้าหู้ ×2',
    carrier: 'Inter Express',
    carrierKey: 'inter',
    status: 'confirmed',
  },
  {
    orderNumber: 'ORD-000141',
    channel: 'Line',
    customer: 'ร้านเจ๊หมวย',
    items: 'เต้าหู้ ×5 · น้ำจิ้ม ×2',
    carrier: 'Nim Express',
    carrierKey: 'nim',
    status: 'confirmed',
  },
  {
    orderNumber: 'ORD-000150',
    channel: 'โทร',
    customer: 'ครัวป้าศรี',
    items: 'เต้าหู้ ×6',
    carrier: 'Inter Express',
    carrierKey: 'inter',
    status: 'confirmed',
    note: 'inserted',
  },
  {
    orderNumber: 'ORD-000140',
    channel: 'TikTok',
    customer: 'วิภา ส.',
    items: 'เต้าหู้ ×1',
    carrier: 'Fuze Express',
    carrierKey: 'fuze',
    status: 'confirmed',
  },
  {
    orderNumber: 'ORD-000128',
    channel: 'Facebook',
    customer: 'คุณนิด',
    items: 'เต้าหู้ ×5 · น้ำจิ้ม ×1',
    carrier: 'Inter Express',
    carrierKey: 'inter',
    status: 'factory_accepted',
    note: 'edited',
  },
  {
    orderNumber: 'ORD-000137',
    channel: 'หน้าร้าน',
    customer: 'ลูกค้าหน้าร้าน',
    items: 'เต้าหู้ ×10',
    carrier: 'รถตู้/รถทัวร์',
    carrierKey: 'van',
    status: 'factory_accepted',
  },
  {
    orderNumber: 'ORD-000136',
    channel: 'โทร',
    customer: 'ครัวป้าศรี',
    items: 'น้ำจิ้ม ×4',
    carrier: 'ส่งจากหน้าร้าน',
    carrierKey: 'store',
    status: 'confirmed',
  },
  {
    orderNumber: 'ORD-000133',
    channel: 'Lazada',
    customer: 'ธนพล ก.',
    items: 'เต้าหู้ ×3',
    carrier: 'Nim Express',
    carrierKey: 'nim',
    status: 'confirmed',
  },
];

export const ROUND_OPTIONS = [
  { value: '13', label: '13 พ.ย. (วันนี้)' },
  { value: '14', label: '14 พ.ย.' },
  { value: '15', label: '15 พ.ย. · ล่วงหน้า 4' },
];

export const PRODUCTION_BY_CARRIER = [
  {
    carrier: 'Inter Express (หาดใหญ่)',
    orders: 18,
    tofu: 78,
    sauce: 30,
    label: 'Platform label 14 · ระบบ 4',
    labelColor: 'blue',
  },
  {
    carrier: 'Nim Express (กทม.)',
    orders: 12,
    tofu: 52,
    sauce: 20,
    label: 'Platform label 9 · ระบบ 3',
    labelColor: 'blue',
  },
  {
    carrier: 'Fuze Express (กทม.)',
    orders: 8,
    tofu: 30,
    sauce: 12,
    label: 'Platform label 8',
    labelColor: 'blue',
  },
  { carrier: 'ส่งจากหน้าร้าน', orders: 5, tofu: 20, sauce: 8, label: 'ไม่ต้องใช้', labelColor: 'gray' },
  { carrier: 'รถตู้/รถทัวร์', orders: 3, tofu: 12, sauce: 4, label: 'ระบบ 3', labelColor: 'gray' },
];

export type PrintState = { printed: number };

export interface PrintRow {
  orderNumber: string;
  channel: string;
  customer: string;
  carrier: string;
  labelSource: 'platform' | 'system';
  pickList: number;
  label: number;
}

export const PRINT_ROWS: PrintRow[] = [
  {
    orderNumber: 'ORD-000142',
    channel: 'Shopee',
    customer: 'สมชาย ใจดี',
    carrier: 'Inter Express',
    labelSource: 'platform',
    pickList: 0,
    label: 0,
  },
  {
    orderNumber: 'ORD-000141',
    channel: 'Line',
    customer: 'ร้านเจ๊หมวย',
    carrier: 'Nim Express',
    labelSource: 'system',
    pickList: 0,
    label: 0,
  },
  {
    orderNumber: 'ORD-000150',
    channel: 'โทร',
    customer: 'ครัวป้าศรี',
    carrier: 'Inter Express',
    labelSource: 'system',
    pickList: 0,
    label: 0,
  },
  {
    orderNumber: 'ORD-000140',
    channel: 'TikTok',
    customer: 'วิภา ส.',
    carrier: 'Fuze Express',
    labelSource: 'platform',
    pickList: 1,
    label: 1,
  },
  {
    orderNumber: 'ORD-000133',
    channel: 'Lazada',
    customer: 'ธนพล ก.',
    carrier: 'Nim Express',
    labelSource: 'platform',
    pickList: 2,
    label: 0,
  },
];

export type ShipTab = 'wait' | 'shipped' | 'done' | 'short';

export interface ShipRow {
  orderNumber: string;
  customer: string;
  carrier: string;
  tracking?: string;
  source?: 'api' | 'manual';
  sync: { label: string; color: string };
  status: { label: string; color: string };
  tab: ShipTab;
  action?: 'track' | 'delivered' | 'short';
}

export const SHIP_ROWS: ShipRow[] = [
  {
    orderNumber: 'ORD-000142',
    customer: 'สมชาย ใจดี',
    carrier: 'Inter Express',
    sync: { label: 'รอ Tracking', color: 'orange' },
    status: { label: 'โรงงานรับแล้ว', color: 'gray' },
    tab: 'wait',
    action: 'track',
  },
  {
    orderNumber: 'ORD-000141',
    customer: 'ร้านเจ๊หมวย',
    carrier: 'Nim Express',
    sync: { label: 'ไม่ต้อง sync', color: 'gray' },
    status: { label: 'โรงงานรับแล้ว', color: 'gray' },
    tab: 'wait',
    action: 'track',
  },
  {
    orderNumber: 'ORD-000139',
    customer: 'คุณนิด',
    carrier: 'Inter Express',
    tracking: 'IE6611300045',
    source: 'api',
    sync: { label: 'สำเร็จ 10:12', color: 'green' },
    status: { label: 'จัดส่งแล้ว', color: 'blue' },
    tab: 'shipped',
  },
  {
    orderNumber: 'ORD-000137',
    customer: 'ลูกค้าหน้าร้าน',
    carrier: 'รถตู้/รถทัวร์',
    tracking: 'VAN-1311-02',
    source: 'manual',
    sync: { label: 'ไม่ต้อง sync', color: 'gray' },
    status: { label: 'จัดส่งแล้ว', color: 'blue' },
    tab: 'shipped',
    action: 'delivered',
  },
  {
    orderNumber: 'ORD-000130',
    customer: 'บจก. สยามฟู้ด',
    carrier: 'Fuze Express',
    tracking: 'FZ88213402',
    source: 'api',
    sync: { label: 'สำเร็จ', color: 'green' },
    status: { label: 'จัดส่งสำเร็จ', color: 'green' },
    tab: 'done',
  },
  {
    orderNumber: 'ORD-000126',
    customer: 'ครัวป้าศรี',
    carrier: 'Nim Express',
    tracking: 'NM5520019',
    source: 'api',
    sync: { label: 'สำเร็จ', color: 'green' },
    status: { label: 'ส่งไม่ครบ 2 แพ็ค', color: 'orange' },
    tab: 'short',
    action: 'short',
  },
];
