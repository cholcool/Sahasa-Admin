import type { Channel, OrderStatus } from '@sahasa/shared';
import type { DeliveryState, PaymentState } from '@/features/orders/labels';

/**
 * Mock database kept in the browser until the real MariaDB tables exist.
 * Dates are YYYY-MM-DD and timestamps are ISO strings with the +07:00 offset (Thai time).
 */

export type CarrierId = 'inter' | 'nim' | 'fuze' | 'store' | 'van';
export type Billing = 'VAT' | 'NOVAT';
export type PaymentMethod = 'platform' | 'transfer' | 'cash';
export type ProductKind = 'tofu' | 'sauce';

/** Price per channel group (Line/Facebook/โทร share one price) */
export interface ChannelPrices {
  storefront: number;
  shopee: number;
  tiktok: number;
  lazada: number;
  lineFb: number;
}

export interface MockProduct {
  id: string;
  name: string;
  shortName: string;
  kind: ProductKind;
  unit: string;
  prices: ChannelPrices;
  active: boolean;
}

export interface MockCarrier {
  id: CarrierId;
  name: string;
  /** Name with the branch, as used on the order forms */
  fullName: string;
  /** Who prints the shipping label for marketplace orders */
  hasApi: boolean;
  trackingPrefix: string;
}

export interface MockAddress {
  id: string;
  name: string;
  phone: string;
  text: string;
  isDefault: boolean;
}

export interface MockCustomer {
  id: string;
  name: string;
  channel: Channel;
  phone: string;
  billing: Billing;
  taxId?: string;
  addresses: MockAddress[];
  /** Regular customer of a manual channel (orders repeat) vs one-off marketplace buyer */
  regular: boolean;
}

export interface MockUser {
  id: string;
  username: string;
  name: string;
  role: string;
  active: boolean;
  lastLoginAt?: string;
}

export interface MockOrderLine {
  productId: string;
  name: string;
  qty: number;
  price: number;
  /** Quantity actually shipped when the order was shipped short */
  shippedQty?: number;
}

export type OrderEventType =
  | 'created'
  | 'edited'
  | 'payment'
  | 'confirmed'
  | 'accepted'
  | 'shipped'
  | 'delivered'
  | 'short'
  | 'cancelled'
  | 'invoiced';

export interface MockOrderEvent {
  at: string;
  by: string;
  type: OrderEventType;
  text: string;
}

export type SyncState = 'none' | 'waiting' | 'ok' | 'error';
export type RevenueState = 'wait' | 'sent' | 'err';

export interface MockOrder {
  orderNumber: string;
  /** Order number on Shopee/Lazada/TikTok */
  platformOrderNo?: string;
  channel: Channel;
  orderedAt: string;
  /** YYYY-MM-DD of orderedAt (Thai time) */
  orderDate: string;
  /** Ship round (cut-off 12:00) as YYYY-MM-DD */
  roundDate: string;
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  billing: Billing;
  lines: MockOrderLine[];
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  payment: PaymentState;
  paidAt?: string;
  carrierId: CarrierId;
  status: OrderStatus;
  delivery: DeliveryState;
  tracking?: string;
  trackingSource?: 'api' | 'manual';
  sync: SyncState;
  acceptedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  insertedAfterCutoff?: boolean;
  editedAfterAccept?: boolean;
  revenue?: { state: RevenueState; at: string; error?: string };
  printed: { pickList: number; label: number };
  createdBy: string;
  history: MockOrderEvent[];
}

export type DocumentKind = 'inv' | 'rc';

export interface MockDocument {
  no: string;
  kind: DocumentKind;
  type: string;
  orderNumber: string;
  customerName: string;
  billing: Billing;
  total: number;
  issuedAt: string;
}

export interface MockCreditNote {
  no: string;
  invoiceNo: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  total: number;
  issuedAt: string;
  voided: boolean;
}

/** Marketplace payout line used by the reconcile page */
export interface MockSettlement {
  orderNumber: string;
  platformOrderNo: string;
  channel: Channel;
  paidAt: string;
  amount: number;
  fee: number;
  shipping: number;
  received: number;
}

export type PlatformName = 'Shopee' | 'Lazada' | 'TikTok Shop';

export interface MockPlatformLog {
  id: string;
  at: string;
  platform: PlatformName;
  action: string;
  ok: boolean;
  count: number;
  message: string;
}

export interface MockUnmappedSku {
  id: string;
  platform: PlatformName;
  sku: string;
  name: string;
  orderNumber: string;
  at: string;
}

export interface MockStockReceipt {
  id: string;
  at: string;
  productId: string;
  qty: number;
  lot: string;
  by: string;
}

export interface MockSettings {
  seed: number;
  from: string;
  to: string;
  minPerDay: number;
  maxPerDay: number;
}

export interface MockDb {
  version: number;
  generatedAt: string;
  settings: MockSettings;
  /** True after "clear all data": transactions removed, master data kept */
  cleared: boolean;
  products: MockProduct[];
  carriers: MockCarrier[];
  customers: MockCustomer[];
  users: MockUser[];
  orders: MockOrder[];
  documents: MockDocument[];
  creditNotes: MockCreditNote[];
  settlements: MockSettlement[];
  platformLogs: MockPlatformLog[];
  unmappedSkus: MockUnmappedSku[];
  stockReceipts: MockStockReceipt[];
}
