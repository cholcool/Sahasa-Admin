import type { Channel, OrderStatus } from '@sahasa/shared';
import { dayjs, formatThaiDate } from '@/lib/dayjs';
import { MOCK_CARRIERS } from './catalog';
import { type PriceGroup, shippingFee, unitPrice } from './pricing';
import type { CarrierId, MockDb, MockOrder, MockProduct } from './types';

// Read-only helpers that turn the mock database into what each page shows

export function carrierName(id: CarrierId, full = false): string {
  const c = MOCK_CARRIERS.find((x) => x.id === id);
  return (full ? c?.fullName : c?.name) ?? id;
}

/** e.g. "เต้าหู้ ×2 · น้ำจิ้ม ×1" */
export function itemsText(order: MockOrder, products: MockProduct[]): string {
  return order.lines
    .map((l) => `${products.find((p) => p.id === l.productId)?.shortName ?? l.name} ×${l.qty}`)
    .join(' · ');
}

export function statusCounts(orders: MockOrder[]): Record<OrderStatus | 'all', number> {
  const counts: Record<OrderStatus | 'all', number> = {
    all: 0,
    pending_review: 0,
    confirmed: 0,
    factory_accepted: 0,
    partially_shipped: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    counts[o.status] += 1;
    counts.all += 1;
  }
  return counts;
}

function zeroByChannel(): Record<Channel, number> {
  return { shopee: 0, lazada: 0, tiktok: 0, line: 0, facebook: 0, storefront: 0, phone: 0 };
}

export function countByChannel(orders: MockOrder[]): Record<Channel, number> {
  const counts = zeroByChannel();
  for (const o of orders) counts[o.channel] += 1;
  return counts;
}

export function salesByChannel(orders: MockOrder[]): Record<Channel, number> {
  const totals = zeroByChannel();
  for (const o of orders) if (o.status !== 'cancelled') totals[o.channel] += o.total;
  return totals;
}

export function countByCarrier(orders: MockOrder[]): Record<CarrierId, number> {
  const counts: Record<CarrierId, number> = { inter: 0, nim: 0, fuze: 0, store: 0, van: 0 };
  for (const o of orders) counts[o.carrierId] += 1;
  return counts;
}

/** Quantity per product id */
export function productQty(orders: MockOrder[]): Record<string, number> {
  const qty: Record<string, number> = {};
  for (const o of orders)
    for (const l of o.lines) qty[l.productId] = (qty[l.productId] ?? 0) + l.qty;
  return qty;
}

export const isActive = (o: MockOrder) => o.status !== 'cancelled';

/** Orders in the factory for a round: confirmed or later, not cancelled */
export function roundOrders(db: MockDb, roundDate: string): MockOrder[] {
  return db.orders.filter(
    (o) => o.roundDate === roundDate && o.status !== 'cancelled' && o.status !== 'pending_review',
  );
}

/** Ship rounds to offer in selectors: a few days around today that have orders */
export function roundChoices(db: MockDb, today: string, before = 1, after = 3): string[] {
  const set = new Set<string>();
  for (let i = -before; i <= after; i++) set.add(dayjs(today).add(i, 'day').format('YYYY-MM-DD'));
  for (const o of db.orders)
    if (o.roundDate > today && o.status !== 'cancelled') set.add(o.roundDate);
  return [...set].toSorted().slice(0, before + after + 3);
}

export function roundLabel(roundDate: string, today: string): string {
  const base = formatThaiDate(roundDate, 'D MMM');
  if (roundDate === today) return `${base} (วันนี้)`;
  return base;
}

/** "13 พ.ย. 2569 · 12:00" style label for a ship round */
export function roundText(roundDate: string): string {
  return `${formatThaiDate(roundDate)} · 12:00`;
}

/** Short Thai date-time, e.g. "13 พ.ย. 09:12" */
export function shortDateTime(at: string): string {
  return formatThaiDate(at, 'D MMM HH:mm');
}

export function findOrder(db: MockDb, orderNumber: string): MockOrder | undefined {
  return db.orders.find((o) => o.orderNumber === orderNumber);
}

export function documentFor(db: MockDb, orderNumber: string) {
  return db.documents.find((d) => d.orderNumber === orderNumber);
}

/** Orders that have shipped but have no tax invoice / receipt yet */
export function ordersAwaitingDocument(db: MockDb): MockOrder[] {
  const issued = new Set(db.documents.map((d) => d.orderNumber));
  return db.orders.filter(
    (o) =>
      ['shipped', 'delivered', 'partially_shipped'].includes(o.status) &&
      !issued.has(o.orderNumber),
  );
}

/** Orders cancelled after an invoice was issued and still without a credit note */
export function cancelledNeedingCreditNote(db: MockDb) {
  return db.documents
    .filter((d) => {
      const o = findOrder(db, d.orderNumber);
      return (
        o?.status === 'cancelled' && !db.creditNotes.some((c) => c.invoiceNo === d.no && !c.voided)
      );
    })
    .map((d) => ({ doc: d, order: findOrder(db, d.orderNumber) }));
}

/** Stock on hand per product: receipts minus quantities that left the factory */
export function stockOnHand(db: MockDb, productId: string, until?: string): number {
  const received = db.stockReceipts
    .filter((r) => r.productId === productId && (!until || r.at <= until))
    .reduce((s, r) => s + r.qty, 0);
  const shipped = db.orders
    .filter((o) => o.shippedAt && (!until || o.shippedAt <= until))
    .reduce(
      (s, o) =>
        s +
        o.lines
          .filter((l) => l.productId === productId)
          .reduce((q, l) => q + (l.shippedQty ?? l.qty), 0),
      0,
    );
  return received - shipped;
}

/** Quantity booked by orders that have not shipped yet */
export function stockReserved(db: MockDb, productId: string): number {
  return db.orders
    .filter((o) => ['confirmed', 'factory_accepted'].includes(o.status))
    .reduce(
      (s, o) => s + o.lines.filter((l) => l.productId === productId).reduce((q, l) => q + l.qty, 0),
      0,
    );
}

/** Products priced for a channel/customer at their first order quantity, for the order forms */
export function productOptions(db: MockDb, channel: Channel, group?: PriceGroup | null) {
  return db.products
    .filter((p) => p.active)
    .map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      price: unitPrice(db.priceRules, p.id, channel, 1, group, p.basePrice),
    }));
}

/** Unit price for a line from the price rules */
export function linePrice(
  db: MockDb,
  productId: string,
  channel: Channel,
  qty: number,
  group?: PriceGroup | null,
): number {
  const base = db.products.find((p) => p.id === productId)?.basePrice ?? 0;
  return unitPrice(db.priceRules, productId, channel, qty, group, base);
}

/** Shipping fee for an order from the shipping rules */
export function orderShipping(
  db: MockDb,
  input: { channel: Channel; carrierId: CarrierId; address: string; productIds: string[] },
) {
  return shippingFee(db.shippingRules, {
    channel: input.channel,
    pickUp: input.carrierId === 'store',
    address: input.address,
    productIds: input.productIds,
  });
}

/** Next 12:00 cut-off from `now` and the time left, e.g. "1 ชม. 25 นาที" */
export function nextCutoff(now = dayjs().tz('Asia/Bangkok')) {
  const todayCut = now.hour(12).minute(0).second(0).millisecond(0);
  const cut = now.isBefore(todayCut) ? todayCut : todayCut.add(1, 'day');
  const mins = cut.diff(now, 'minute');
  const left = mins >= 60 ? `${Math.floor(mins / 60)} ชม. ${mins % 60} นาที` : `${mins} นาที`;
  const roundDate = cut.format('YYYY-MM-DD');
  return { roundDate, isToday: roundDate === now.format('YYYY-MM-DD'), left };
}

export interface StockMove {
  id: string;
  at: string;
  type: 'order' | 'receive' | 'adjust';
  ref: string;
  productId: string;
  in: number;
  out: number;
  balance: number;
  by: string;
}

/** Stock in/out per product with a running balance, newest first */
export function stockMovements(db: MockDb, until?: string): StockMove[] {
  const moves: Omit<StockMove, 'balance'>[] = [];
  for (const r of db.stockReceipts) {
    if (until && r.at > until) continue;
    const adjust = r.lot.startsWith('ปรับยอด');
    moves.push({
      id: r.id,
      at: r.at,
      type: adjust ? 'adjust' : 'receive',
      ref: r.lot,
      productId: r.productId,
      in: Math.max(0, r.qty),
      out: Math.max(0, -r.qty),
      by: r.by,
    });
  }
  for (const o of db.orders) {
    if (!o.shippedAt || (until && o.shippedAt > until)) continue;
    for (const l of o.lines) {
      moves.push({
        id: `${o.orderNumber}-${l.productId}`,
        at: o.shippedAt,
        type: 'order',
        ref: o.orderNumber,
        productId: l.productId,
        in: 0,
        out: l.shippedQty ?? l.qty,
        by: 'ระบบ',
      });
    }
  }
  const balance: Record<string, number> = {};
  const withBalance = moves
    .toSorted((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id))
    .map((m) => {
      balance[m.productId] = (balance[m.productId] ?? 0) + m.in - m.out;
      return { ...m, balance: balance[m.productId] ?? 0 };
    });
  return withBalance.toReversed();
}
