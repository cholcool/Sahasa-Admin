import type { Channel, OrderStatus } from '@sahasa/shared';
import type { DeliveryState, PaymentState } from './labels';

// Sample data copied from UI Prototype/pages/03-xx — TODO: replace with the orders API

export interface OrderSummary {
  orderNumber: string;
  channel: Channel;
  customerName: string;
  total: number;
  payment: PaymentState;
  round: string;
  carrier: string;
  delivery: DeliveryState;
  status: OrderStatus;
  cancelReason?: string;
}

export const MOCK_ORDERS: OrderSummary[] = [
  {
    orderNumber: 'ORD-000142',
    channel: 'shopee',
    customerName: 'สมชาย ใจดี',
    total: 380,
    payment: 'platform',
    round: '13 พ.ย.',
    carrier: 'Inter Express',
    delivery: 'none',
    status: 'pending_review',
  },
  {
    orderNumber: 'ORD-000141',
    channel: 'line',
    customerName: 'ร้านเจ๊หมวย',
    total: 1250,
    payment: 'awaiting',
    round: '13 พ.ย.',
    carrier: 'Nim Express',
    delivery: 'none',
    status: 'pending_review',
  },
  {
    orderNumber: 'ORD-000140',
    channel: 'tiktok',
    customerName: 'วิภา ส.',
    total: 190,
    payment: 'platform',
    round: '13 พ.ย.',
    carrier: 'Fuze Express',
    delivery: 'none',
    status: 'confirmed',
  },
  {
    orderNumber: 'ORD-000139',
    channel: 'facebook',
    customerName: 'คุณนิด',
    total: 570,
    payment: 'paid',
    round: '13 พ.ย.',
    carrier: 'รถตู้/รถทัวร์',
    delivery: 'waiting',
    status: 'factory_accepted',
  },
  {
    orderNumber: 'ORD-000138',
    channel: 'lazada',
    customerName: 'ธนพล ก.',
    total: 380,
    payment: 'platform',
    round: '12 พ.ย.',
    carrier: 'Inter Express',
    delivery: 'in_transit',
    status: 'shipped',
  },
  {
    orderNumber: 'ORD-000137',
    channel: 'storefront',
    customerName: 'ลูกค้าหน้าร้าน',
    total: 190,
    payment: 'paid',
    round: '12 พ.ย.',
    carrier: 'ส่งจากหน้าร้าน',
    delivery: 'delivered',
    status: 'delivered',
  },
  {
    orderNumber: 'ORD-000136',
    channel: 'phone',
    customerName: 'ครัวป้าศรี',
    total: 950,
    payment: 'paid',
    round: '15 พ.ย. (ล่วงหน้า)',
    carrier: 'Nim Express',
    delivery: 'none',
    status: 'confirmed',
  },
  {
    orderNumber: 'ORD-000135',
    channel: 'shopee',
    customerName: 'อรทัย พ.',
    total: 380,
    payment: 'platform',
    round: '12 พ.ย.',
    carrier: 'Inter Express',
    delivery: 'none',
    status: 'cancelled',
    cancelReason: 'ลูกค้าขอยกเลิก',
  },
];

/** Counts shown on the status tabs of the order list (whole dataset, not just the sample rows) */
export const MOCK_STATUS_COUNTS: Partial<Record<OrderStatus | 'all', number>> = {
  all: 230,
  pending_review: 12,
  confirmed: 28,
  factory_accepted: 15,
  shipped: 40,
  delivered: 132,
  cancelled: 3,
};

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 'PRD-001', name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', unit: 'แพ็ค', price: 190 },
  { id: 'PRD-002', name: 'น้ำจิ้ม 400g', unit: 'ขวด', price: 125 },
];

export interface CustomerOption {
  name: string;
  channel: string;
  phone: string;
  addresses: number;
  billing: 'VAT' | 'NOVAT';
}

export const MOCK_CUSTOMERS: CustomerOption[] = [
  { name: 'ร้านเจ๊หมวย', channel: 'Line', phone: '081-234-5678', addresses: 2, billing: 'NOVAT' },
  { name: 'ครัวป้าศรี', channel: 'โทร', phone: '081-998-1122', addresses: 1, billing: 'VAT' },
  { name: 'บจก. สยามฟู้ด', channel: 'Facebook', phone: '081-555-0101', addresses: 3, billing: 'VAT' },
];

export const MOCK_ADDRESSES = [
  {
    id: 'a1',
    name: 'เจ๊หมวย (หน้าร้าน)',
    isDefault: true,
    text: '99/9 ถ.ตัวอย่าง ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110 · 081-234-5678',
  },
  {
    id: 'a2',
    name: 'คุณต้น (สาขา 2)',
    isDefault: false,
    text: '12 ถ.เพชรเกษม ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90112 · 089-111-2233',
  },
];

export const ROUNDS = [
  '13 พ.ย. 2569 · 12:00',
  '14 พ.ย. 2569 · 12:00',
  '15 พ.ย. 2569 · 12:00',
  '16 พ.ย. 2569 · 12:00',
];

/** Detail of ORD-000141 used by the detail and edit pages */
export const MOCK_ORDER_DETAIL = {
  orderNumber: 'ORD-000141',
  status: 'pending_review' as OrderStatus,
  channel: 'line' as Channel,
  createdBy: 'Sales01',
  createdAt: '13 พ.ย. 2569 09:12',
  customer: { name: 'ร้านเจ๊หมวย', phone: '081-234-5678' },
  address: '99/9 ถ.ตัวอย่าง ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
  billing: 'NOVAT',
  paymentMethod: 'โอน',
  payment: 'awaiting' as PaymentState,
  carrier: 'Nim Express (กทม.)',
  round: '13 พ.ย. 2569 · 12:00',
  tracking: null as string | null,
  delivery: 'none' as DeliveryState,
  shippingFee: 50,
  lines: [
    { productId: 'PRD-001', name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', qty: 5, price: 190 },
    { productId: 'PRD-002', name: 'น้ำจิ้ม 400g', qty: 2, price: 125 },
  ],
  history: [
    { at: '13 พ.ย. 09:30', text: 'Sales01 แก้ไขจำนวน เต้าหู้คลองแงะ แพ็ค 10 ชิ้น: 4 → 5' },
    { at: '13 พ.ย. 09:12', text: 'Sales01 สร้าง Order (ช่องทาง Line)' },
  ],
};
