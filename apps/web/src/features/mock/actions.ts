import type { Channel } from '@sahasa/shared';
import { dayjs } from '@/lib/dayjs';
import { isMarketplace, MOCK_CARRIERS } from './catalog';
import type { PriceRule, ShippingRule } from './pricing';
import { orderShipping } from './selectors';
import { channelText } from './generate';
import { updateMockDb } from './store';
import type {
  Billing,
  CarrierId,
  DocumentKind,
  MockCustomer,
  MockDb,
  MockOrder,
  MockOrderEvent,
  MockOrderLine,
  MockProduct,
  PaymentMethod,
} from './types';

/**
 * State changes used by the prototype pages (confirm, cancel, accept, ship…).
 * Each one writes the mock database and appends to the order history (= audit log).
 */

/** The prototype is always signed in as Admin */
export const CURRENT_USER = 'admin';

export function nowThai(): string {
  return dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ssZ');
}

function log(order: MockOrder, type: MockOrderEvent['type'], text: string, by = CURRENT_USER) {
  order.history.push({ at: nowThai(), by, type, text });
}

function each(db: MockDb, orderNumbers: string[], fn: (o: MockOrder) => void) {
  const wanted = new Set(orderNumbers);
  for (const o of db.orders) if (wanted.has(o.orderNumber)) fn(o);
}

const totalOf = (lines: MockOrderLine[], shippingFee: number) =>
  lines.reduce((s, l) => s + Math.round(l.price * 100) * Math.max(0, Math.trunc(l.qty)), 0) / 100 +
  shippingFee;

export function confirmOrders(orderNumbers: string[]) {
  updateMockDb((db) =>
    each(db, orderNumbers, (o) => {
      if (o.status !== 'pending_review') return;
      o.status = 'confirmed';
      o.revenue = { state: 'wait', at: nowThai() };
      log(o, 'confirmed', `${CURRENT_USER} ยืนยัน Order · เข้าคิวโรงงาน`);
    }),
  );
}

export function cancelOrder(orderNumber: string, reason: string, note?: string) {
  updateMockDb((db) =>
    each(db, [orderNumber], (o) => {
      o.status = 'cancelled';
      o.delivery = 'none';
      o.cancelReason = reason;
      o.cancelledAt = nowThai();
      o.revenue = undefined;
      log(o, 'cancelled', `ยกเลิก Order · ${reason}${note ? ` (${note})` : ''}`);
    }),
  );
}

export function confirmPayment(orderNumber: string, method: PaymentMethod, amount: number) {
  updateMockDb((db) =>
    each(db, [orderNumber], (o) => {
      o.payment = 'paid';
      o.paymentMethod = method;
      o.paidAt = nowThai();
      log(
        o,
        'payment',
        `${CURRENT_USER} ยืนยันรับเงิน ${method === 'cash' ? 'เงินสด' : method === 'transfer' ? 'โอน' : 'ผ่าน Platform'} ฿${amount.toLocaleString('en-US')}`,
      );
    }),
  );
}

export function acceptOrders(orderNumbers: string[]) {
  updateMockDb((db) =>
    each(db, orderNumbers, (o) => {
      if (o.status !== 'confirmed') return;
      o.status = 'factory_accepted';
      o.delivery = 'waiting';
      o.acceptedAt = nowThai();
      if (isMarketplace(o.channel)) o.sync = 'waiting';
      log(o, 'accepted', `${CURRENT_USER} รับ Order (โรงงาน)`);
    }),
  );
}

export function recordTracking(orderNumber: string, carrierId: CarrierId, tracking: string) {
  updateMockDb((db) =>
    each(db, [orderNumber], (o) => {
      o.carrierId = carrierId;
      o.tracking = tracking;
      o.trackingSource = 'manual';
      o.status = 'shipped';
      o.delivery = 'in_transit';
      o.shippedAt = nowThai();
      o.sync = isMarketplace(o.channel) ? 'ok' : 'none';
      if (o.printed.pickList === 0) o.printed.pickList = 1;
      log(o, 'shipped', `บันทึก Tracking ${tracking} · จัดส่งแล้ว`);
    }),
  );
}

export function markDelivered(orderNumber: string, receiver?: string) {
  updateMockDb((db) =>
    each(db, [orderNumber], (o) => {
      o.status = 'delivered';
      o.delivery = 'delivered';
      o.deliveredAt = nowThai();
      log(o, 'delivered', `จัดส่งสำเร็จ${receiver ? ` · ผู้รับ ${receiver}` : ''}`);
    }),
  );
}

export function recordShortShipment(orderNumber: string, sent: Record<string, number>) {
  updateMockDb((db) =>
    each(db, [orderNumber], (o) => {
      const short: string[] = [];
      for (const l of o.lines) {
        const qty = sent[l.productId];
        if (qty === undefined) continue;
        l.shippedQty = Math.max(0, Math.min(l.qty, qty));
        if (l.shippedQty < l.qty) short.push(`${l.name} ขาด ${l.qty - l.shippedQty}`);
      }
      if (short.length > 0) {
        o.status = 'partially_shipped';
        log(o, 'short', `ส่งไม่ครบ ${short.join(', ')}`);
      }
    }),
  );
}

export function markPrinted(orderNumbers: string[], doc: 'pickList' | 'label') {
  updateMockDb((db) =>
    each(db, orderNumbers, (o) => {
      o.printed[doc] += 1;
    }),
  );
}

export interface OrderInput {
  channel: Channel;
  customerId: string;
  addressId?: string;
  billing: Billing;
  lines: MockOrderLine[];
  carrierId: CarrierId;
  roundDate: string;
  paymentMethod: Exclude<PaymentMethod, 'platform'>;
  /** Slip attached / cash received when saving */
  paid: boolean;
  insertedAfterCutoff?: boolean;
}

/** Create a manual order; returns its number */
export function createOrder(input: OrderInput): string {
  let orderNumber = '';
  updateMockDb((db) => {
    const max = db.orders.reduce((m, o) => Math.max(m, Number(o.orderNumber.slice(4)) || 0), 0);
    orderNumber = `ORD-${String(max + 1).padStart(6, '0')}`;
    const customer = db.customers.find((c) => c.id === input.customerId);
    const address =
      customer?.addresses.find((a) => a.id === input.addressId) ??
      customer?.addresses.find((a) => a.isDefault);
    const at = nowThai();
    const shippingFee = orderShipping(db, {
      channel: input.channel,
      carrierId: input.carrierId,
      address: address?.text ?? '',
      productIds: input.lines.filter((l) => l.qty > 0).map((l) => l.productId),
    }).fee;
    const order: MockOrder = {
      orderNumber,
      channel: input.channel,
      orderedAt: at,
      orderDate: at.slice(0, 10),
      roundDate: input.roundDate,
      customerId: input.customerId,
      customerName: customer?.name ?? '-',
      phone: address?.phone ?? customer?.phone ?? '-',
      address: address?.text ?? '',
      billing: input.billing,
      lines: input.lines.filter((l) => l.qty > 0),
      shippingFee,
      total: totalOf(input.lines, shippingFee),
      paymentMethod: input.paymentMethod,
      payment: input.paid ? 'paid' : 'awaiting',
      paidAt: input.paid ? at : undefined,
      carrierId: input.carrierId,
      status: 'pending_review',
      delivery: 'none',
      sync: 'none',
      insertedAfterCutoff: input.insertedAfterCutoff || undefined,
      printed: { pickList: 0, label: 0 },
      createdBy: CURRENT_USER,
      history: [
        {
          at,
          by: CURRENT_USER,
          type: 'created',
          text: `${CURRENT_USER} สร้าง Order (ช่องทาง ${channelText(input.channel)})`,
        },
      ],
    };
    db.orders.push(order);
  });
  return orderNumber;
}

export interface OrderEdit {
  lines: MockOrderLine[];
  carrierId: CarrierId;
  roundDate: string;
  addressId?: string;
}

export function updateOrder(orderNumber: string, edit: OrderEdit) {
  updateMockDb((db) =>
    each(db, [orderNumber], (o) => {
      const changes: string[] = [];
      for (const l of edit.lines) {
        const old = o.lines.find((x) => x.productId === l.productId);
        if (!old) changes.push(`เพิ่ม ${l.name} ${l.qty}`);
        else if (old.qty !== l.qty) changes.push(`${l.name}: ${old.qty} → ${l.qty}`);
      }
      for (const old of o.lines) {
        if (!edit.lines.some((l) => l.productId === old.productId)) changes.push(`ลบ ${old.name}`);
      }
      if (o.carrierId !== edit.carrierId) {
        changes.push(`ขนส่ง → ${MOCK_CARRIERS.find((c) => c.id === edit.carrierId)?.name ?? ''}`);
      }
      if (o.roundDate !== edit.roundDate) changes.push(`รอบส่ง → ${edit.roundDate}`);
      const customer = db.customers.find((c) => c.id === o.customerId);
      const address = customer?.addresses.find((a) => a.id === edit.addressId);
      if (address && address.text !== o.address) {
        o.address = address.text;
        o.phone = address.phone;
        changes.push('เปลี่ยนที่อยู่จัดส่ง');
      }
      o.lines = edit.lines.filter((l) => l.qty > 0);
      o.carrierId = edit.carrierId;
      o.roundDate = edit.roundDate;
      o.shippingFee = orderShipping(db, {
        channel: o.channel,
        carrierId: o.carrierId,
        address: o.address,
        productIds: o.lines.map((l) => l.productId),
      }).fee;
      o.total = totalOf(o.lines, o.shippingFee);
      if (o.status === 'factory_accepted') o.editedAfterAccept = true;
      if (changes.length > 0) {
        log(
          o,
          'edited',
          `${CURRENT_USER} แก้ไข ${changes.join(', ')}${o.status === 'factory_accepted' ? ' (หลังโรงงานรับ)' : ''}`,
        );
      }
    }),
  );
}

export function nextDocumentNo(db: MockDb, prefix: 'INV' | 'RC' | 'CN', at: string): string {
  const period = dayjs(at).format('YYMM');
  const key = `${prefix}-${period}-`;
  const numbers = [...db.documents.map((d) => d.no), ...db.creditNotes.map((c) => c.no)]
    .filter((no) => no.startsWith(key))
    .map((no) => Number(no.slice(key.length)) || 0);
  return `${key}${String(Math.max(0, ...numbers) + 1).padStart(4, '0')}`;
}

export function issueDocuments(orderNumbers: string[], kind: DocumentKind, type: string) {
  updateMockDb((db) =>
    each(db, orderNumbers, (o) => {
      if (db.documents.some((d) => d.orderNumber === o.orderNumber)) return;
      const at = nowThai();
      const no = nextDocumentNo(db, kind === 'inv' ? 'INV' : 'RC', at);
      db.documents.push({
        no,
        kind,
        type,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        billing: o.billing,
        total: o.total,
        issuedAt: at,
      });
      log(o, 'invoiced', `ออกเอกสาร ${no}`);
    }),
  );
}

export function createCreditNote(invoiceNo: string, reason: string, total: number) {
  updateMockDb((db) => {
    const doc = db.documents.find((d) => d.no === invoiceNo);
    if (!doc) return;
    const at = nowThai();
    db.creditNotes.push({
      no: nextDocumentNo(db, 'CN', at),
      invoiceNo,
      orderNumber: doc.orderNumber,
      customerName: doc.customerName,
      reason,
      total,
      issuedAt: at,
      voided: false,
    });
  });
}

export function markRevenueSent(orderNumbers: string[]) {
  updateMockDb((db) =>
    each(db, orderNumbers, (o) => {
      if (o.revenue?.state === 'wait') o.revenue = { ...o.revenue, state: 'sent' };
    }),
  );
}

export function resolveUnmappedSku(id: string) {
  updateMockDb((db) => {
    db.unmappedSkus = db.unmappedSkus.filter((u) => u.id !== id);
  });
}

export function addStockReceipt(productId: string, qty: number, lot: string) {
  updateMockDb((db) => {
    db.stockReceipts.push({
      id: `R-${Date.now()}`,
      at: nowThai(),
      productId,
      qty,
      lot,
      by: CURRENT_USER,
    });
  });
}

export function createCustomer(
  input: Omit<MockCustomer, 'id' | 'addresses' | 'regular'> & {
    address: { name: string; phone: string; text: string };
  },
): string {
  let id = '';
  updateMockDb((db) => {
    const max = db.customers.reduce((m, c) => Math.max(m, Number(c.id.slice(2)) || 0), 0);
    id = `C-${String(max + 1).padStart(4, '0')}`;
    db.customers.push({
      id,
      name: input.name,
      channel: input.channel,
      phone: input.phone,
      billing: input.billing,
      taxId: input.taxId,
      regular: true,
      addresses: [{ id: `A-${id}-1`, ...input.address, isDefault: true }],
    });
  });
  return id;
}

/** Retry a failed integration call (mock: always succeeds) */
export function resyncLog(id: string) {
  updateMockDb((db) => {
    const entry = db.platformLogs.find((l) => l.id === id);
    if (!entry || entry.ok) return;
    entry.ok = true;
    entry.message = `Re-sync สำเร็จ · ${entry.message}`;
  });
}

/** Add or update a product (prices per channel group) */
export function saveProduct(product: MockProduct) {
  updateMockDb((db) => {
    const i = db.products.findIndex((p) => p.id === product.id);
    if (i >= 0) db.products[i] = product;
    else db.products.push(product);
  });
}

/** Change one price rule's price (Project Detail › ราคาสินค้า) */
export function savePriceRule(id: string, price: PriceRule['price']) {
  updateMockDb((db) => {
    const rule = db.priceRules.find((r) => r.id === id);
    if (rule) rule.price = price;
  });
}

export function saveShippingRule(id: string, fee: ShippingRule['fee']) {
  updateMockDb((db) => {
    const rule = db.shippingRules.find((r) => r.id === id);
    if (rule) rule.fee = fee;
  });
}
