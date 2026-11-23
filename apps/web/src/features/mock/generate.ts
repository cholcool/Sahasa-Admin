import { CHANNELS, type Channel, type OrderStatus } from '@sahasa/shared';
import { dayjs, todayIso } from '@/lib/dayjs';
import {
  AREAS,
  CANCEL_REASONS_MOCK,
  CHANNEL_WEIGHTS,
  FIRST_NAMES,
  isMarketplace,
  LAST_INITIALS,
  MOCK_CARRIERS,
  MOCK_PRODUCTS,
  MOCK_USERS,
  PLATFORM_FEE_RATE,
  PLATFORM_OF,
  ROADS,
  SHOP_NAMES,
  SHOP_PRICE_GROUPS,
  SOUTH_AREA_COUNT,
} from './catalog';
import {
  DEFAULT_PRICE_RULES,
  DEFAULT_SHIPPING_RULES,
  type PriceGroup,
  shippingFee as shippingFeeOf,
  TOFU_ID,
  unitPrice,
} from './pricing';
import { createRng, type Rng } from './random';
import type {
  CarrierId,
  MockCreditNote,
  MockCustomer,
  MockDb,
  MockDocument,
  MockOrder,
  MockOrderEvent,
  MockOrderLine,
  MockPlatformLog,
  MockSettings,
  MockSettlement,
  MockStockReceipt,
  MockUnmappedSku,
  PlatformName,
} from './types';

export const MOCK_DB_VERSION = 2;

export const DEFAULT_SETTINGS: MockSettings = {
  seed: 20261101,
  from: '2026-11-01',
  to: '2026-11-30',
  minPerDay: 15,
  maxPerDay: 40,
};

/** Timestamp in Thai time, e.g. 2026-11-13T09:05:00+07:00 */
export function thaiTime(date: string, hour: number, minute = 0): string {
  const h = Math.min(23, Math.max(0, Math.floor(hour)));
  const m = Math.min(59, Math.max(0, Math.floor(minute)));
  return `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+07:00`;
}

export function addDays(date: string, days: number): string {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
}

export function diffDays(a: string, b: string): number {
  return dayjs(a).diff(dayjs(b), 'day');
}

/** Add minutes to a Thai-time timestamp and keep the +07:00 form */
export function addMinutes(at: string, minutes: number): string {
  return dayjs(at).tz('Asia/Bangkok').add(minutes, 'minute').format('YYYY-MM-DDTHH:mm:ssZ');
}

function phone(rng: Rng): string {
  return `0${rng.pick(['8', '9', '6'])}${rng.int(0, 9)}-${rng.int(100, 999)}-${rng.int(1000, 9999)}`;
}

function address(rng: Rng, southOnly: boolean): string {
  const area = southOnly ? AREAS[rng.int(0, SOUTH_AREA_COUNT - 1)] : rng.pick(AREAS);
  return `${rng.int(1, 299)}/${rng.int(1, 99)} ${rng.pick(ROADS)} ${area}`;
}

function generateCustomers(rng: Rng): MockCustomer[] {
  const customers: MockCustomer[] = [];
  const manual: Channel[] = ['line', 'line', 'facebook', 'phone', 'storefront'];
  SHOP_NAMES.forEach((name, i) => {
    const priceGroup: PriceGroup | undefined = SHOP_PRICE_GROUPS[name];
    const isCompany = /^(บจก\.|หจก\.|บริษัท)/.test(name);
    const wholesale = priceGroup === 'wholesale_a' || priceGroup === 'wholesale_b';
    const billing = !wholesale && (isCompany || rng.chance(0.2)) ? 'VAT' : 'NOVAT';
    const tel = phone(rng);
    const addrCount = rng.int(1, 3);
    customers.push({
      id: `C-${String(i + 1).padStart(4, '0')}`,
      name,
      channel: priceGroup ? rng.pick(['line', 'phone'] as const) : rng.pick(manual),
      phone: tel,
      billing,
      // A couple of VAT customers without a tax ID show the "missing tax ID" error in accounting
      taxId:
        billing === 'VAT' && (priceGroup !== undefined || rng.chance(0.85))
          ? `0${rng.int(100000000000, 999999999999)}`
          : undefined,
      regular: true,
      priceGroup,
      addresses: Array.from({ length: addrCount }, (_, j) => ({
        id: `A-${i + 1}-${j + 1}`,
        name: j === 0 ? name : `${rng.pick(FIRST_NAMES)} (สาขา ${j + 1})`,
        phone: j === 0 ? tel : phone(rng),
        // Most shops are in the south; some are in other regions (shipping 100)
        text: address(rng, rng.chance(0.75)),
        isDefault: j === 0,
      })),
    });
  });
  for (let i = 0; i < 90; i++) {
    const name = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_INITIALS)}`;
    const tel = phone(rng);
    const id = `C-${String(SHOP_NAMES.length + i + 1).padStart(4, '0')}`;
    customers.push({
      id,
      name,
      channel: rng.weighted(['shopee', 'tiktok', 'lazada'] as const, [30, 18, 10]),
      phone: tel,
      billing: rng.chance(0.05) ? 'VAT' : 'NOVAT',
      regular: false,
      addresses: [{ id: `A-${id}`, name, phone: tel, text: address(rng, false), isDefault: true }],
    });
  }
  customers.push({
    id: 'C-WALKIN',
    name: 'ลูกค้าหน้าร้าน',
    channel: 'storefront',
    phone: '-',
    billing: 'NOVAT',
    regular: true,
    addresses: [
      { id: 'A-WALKIN', name: 'รับที่หน้าร้าน', phone: '-', text: 'รับสินค้าที่หน้าร้าน', isDefault: true },
    ],
  });
  return customers;
}

function pickCarrier(rng: Rng, channel: Channel, addr: string): CarrierId {
  if (channel === 'storefront') return rng.chance(0.8) ? 'store' : 'van';
  if (isMarketplace(channel)) return rng.weighted(['inter', 'nim', 'fuze'] as const, [45, 35, 20]);
  const south = AREAS.slice(0, SOUTH_AREA_COUNT).some((a) => addr.endsWith(a));
  return south
    ? rng.weighted(['inter', 'van', 'nim', 'fuze'] as const, [40, 25, 20, 15])
    : rng.weighted(['nim', 'fuze', 'inter'] as const, [45, 35, 20]);
}

/** Tofu pieces per order by channel (Line/Facebook/Shopee/TikTok order in tens from 10) */
function tofuQty(rng: Rng, channel: Channel, group?: PriceGroup): number {
  if (group === 'jfb') return rng.int(4, 12) * 50;
  if (group === 'franchise') return rng.int(3, 8) * 50;
  if (group) return rng.int(5, 15) * 20;
  switch (channel) {
    case 'lazada':
      return rng.weighted([1, 2, 3, 4, 5, 6, 8, 10], [18, 20, 15, 12, 12, 8, 8, 7]);
    case 'shopee':
      return rng.weighted([10, 20, 30, 40, 50, 60], [35, 25, 15, 12, 8, 5]);
    case 'tiktok':
      return rng.weighted([10, 20, 30], [60, 30, 10]);
    default:
      return rng.weighted([10, 20, 30, 40, 50, 60, 80, 100], [25, 20, 15, 12, 10, 8, 6, 4]);
  }
}

function pickLines(rng: Rng, channel: Channel, group?: PriceGroup): MockOrderLine[] {
  const [tofu, sauce] = MOCK_PRODUCTS;
  if (!tofu || !sauce) return [];
  const lines: MockOrderLine[] = [];
  // Companies with their own price buy tofu only; others sometimes buy sauce only
  const sauceOnly = !group && rng.chance(0.07);
  if (!sauceOnly)
    lines.push({
      productId: tofu.id,
      name: tofu.name,
      qty: tofuQty(rng, channel, group),
      price: 0,
    });
  if (sauceOnly || (!group && rng.chance(0.4))) {
    lines.push({
      productId: sauce.id,
      name: sauce.name,
      qty: rng.weighted([1, 2, 3, 4], [50, 30, 12, 8]),
      price: 0,
    });
  }
  return lines;
}

/** Apply the price rules to every line (after any quantity edits) */
function priceLines(lines: MockOrderLine[], channel: Channel, group?: PriceGroup) {
  for (const l of lines) {
    const base = MOCK_PRODUCTS.find((p) => p.id === l.productId)?.basePrice ?? 0;
    l.price = unitPrice(DEFAULT_PRICE_RULES, l.productId, channel, l.qty, group, base);
  }
}

function orderHour(rng: Rng, channel: Channel): number {
  if (channel === 'storefront') return rng.int(8, 17);
  return rng.weighted(
    [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    [2, 5, 8, 9, 9, 6, 6, 6, 6, 6, 6, 7, 8, 9, 7, 4],
  );
}

/** Status of an order whose ship round is `d` days from today */
function pickStatus(rng: Rng, d: number): OrderStatus {
  if (d > 0) return rng.chance(0.45) ? 'pending_review' : 'confirmed';
  if (d === 0)
    return rng.weighted(['pending_review', 'confirmed', 'factory_accepted'] as const, [10, 40, 50]);
  if (d === -1)
    return rng.weighted(['factory_accepted', 'shipped', 'delivered'] as const, [10, 75, 15]);
  if (d === -2) return rng.weighted(['shipped', 'delivered'] as const, [45, 55]);
  return rng.weighted(['delivered', 'shipped', 'partially_shipped'] as const, [95, 3, 2]);
}

const STATUS_RANK: Record<OrderStatus, number> = {
  pending_review: 0,
  confirmed: 1,
  factory_accepted: 2,
  partially_shipped: 3,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

const sales = MOCK_USERS.filter((u) => u.role === 'Sales' && u.active);
const factory = MOCK_USERS.filter((u) => u.role === 'Factory');

function sum(lines: MockOrderLine[]): number {
  return lines.reduce((s, l) => s + l.qty * l.price, 0);
}

interface DraftOrder extends Omit<MockOrder, 'orderNumber'> {
  sortKey: string;
}

function buildOrder(rng: Rng, date: string, today: string, customers: MockCustomer[]): DraftOrder {
  const channel = rng.weighted(
    CHANNELS,
    CHANNELS.map((c) => CHANNEL_WEIGHTS[c]),
  );
  const marketplace = isMarketplace(channel);
  const pool = customers.filter((c) =>
    channel === 'storefront'
      ? c.channel === 'storefront' || c.id === 'C-WALKIN'
      : marketplace
        ? !c.regular
        : c.regular && c.id !== 'C-WALKIN',
  );
  const customer =
    channel === 'storefront' && rng.chance(0.6)
      ? (customers.find((c) => c.id === 'C-WALKIN') ?? rng.pick(pool))
      : rng.pick(pool);
  const addr = customer.addresses.find((a) => a.isDefault) ?? customer.addresses[0];
  const hour = orderHour(rng, channel);
  const minute = rng.int(0, 59);
  const orderedAt = thaiTime(date, hour, minute);

  // Cut-off 12:00: before → today's round, after → next day; some manual orders are booked ahead
  let roundDate = hour < 12 ? date : addDays(date, 1);
  let insertedAfterCutoff = false;
  if (!marketplace && hour === 12 && rng.chance(0.35)) {
    roundDate = date;
    insertedAfterCutoff = true;
  } else if (!marketplace && rng.chance(0.08)) {
    roundDate = addDays(date, rng.int(2, 3));
  }

  const carrierId = pickCarrier(rng, channel, addr?.text ?? '');
  const group = customer.priceGroup;
  const lines = pickLines(rng, channel, group);
  priceLines(lines, channel, group);
  const shippingFee = shippingFeeOf(DEFAULT_SHIPPING_RULES, {
    channel,
    pickUp: carrierId === 'store',
    address: addr?.text ?? '',
    productIds: lines.map((l) => l.productId),
  }).fee;
  const total = sum(lines) + shippingFee;
  const paymentMethod = marketplace
    ? 'platform'
    : channel === 'storefront' || rng.chance(0.2)
      ? 'cash'
      : 'transfer';

  const d = diffDays(roundDate, today);
  const cancelled = rng.chance(0.03);
  // Cancelled orders stop before shipping: pick the stage they reached first
  let status: OrderStatus = cancelled
    ? rng.weighted(['pending_review', 'confirmed', 'factory_accepted'] as const, [50, 35, 15])
    : pickStatus(rng, d);
  if (cancelled && d > 0 && status === 'factory_accepted') status = 'confirmed';

  const seller = rng.pick(sales);
  const createdBy = marketplace ? `ระบบ (${PLATFORM_OF[channel] ?? channel})` : seller.username;
  const history: MockOrderEvent[] = [
    {
      at: orderedAt,
      by: createdBy,
      type: 'created',
      text: marketplace
        ? `ดึง Order จาก ${PLATFORM_OF[channel] ?? channel}`
        : `${seller.username} สร้าง Order (ช่องทาง ${channelText(channel)})`,
    },
  ];

  // Some manual orders get a quantity fix soon after they are keyed in
  const firstLine = lines[0];
  const step = firstLine?.productId === TOFU_ID ? 10 : 1;
  if (!marketplace && firstLine && firstLine.qty > step && rng.chance(0.12)) {
    history.push({
      at: addMinutes(orderedAt, rng.int(3, 30)),
      by: seller.username,
      type: 'edited',
      text: `${seller.username} แก้ไขจำนวน ${firstLine.name}: ${firstLine.qty - step} → ${firstLine.qty}`,
    });
  }

  let payment: MockOrder['payment'] = marketplace ? 'platform' : 'paid';
  let paidAt: string | undefined;
  if (!marketplace) {
    if (status === 'pending_review' && paymentMethod === 'transfer' && rng.chance(0.6)) {
      payment = 'awaiting';
    } else {
      paidAt = addMinutes(orderedAt, paymentMethod === 'cash' ? 1 : rng.int(5, 90));
      history.push({
        at: paidAt,
        by: seller.username,
        type: 'payment',
        text: `${seller.username} ยืนยันรับเงิน ${paymentMethod === 'cash' ? 'เงินสด' : 'โอน'} ฿${total.toLocaleString('en-US')}`,
      });
    }
  }

  const rank = STATUS_RANK[status];
  const confirmedAt = addMinutes(paidAt ?? orderedAt, rng.int(5, 100));
  if (rank >= 1) {
    history.push({
      at: confirmedAt,
      by: seller.username,
      type: 'confirmed',
      text: `${seller.username} ยืนยัน Order · เข้าคิวโรงงาน`,
    });
  }

  const worker = rng.pick(factory);
  const carrier = MOCK_CARRIERS.find((c) => c.id === carrierId);
  let acceptedAt: string | undefined;
  let shippedAt: string | undefined;
  let deliveredAt: string | undefined;
  let tracking: string | undefined;
  let trackingSource: MockOrder['trackingSource'];
  if (rank >= 2) {
    acceptedAt = thaiTime(roundDate, 12, rng.int(15, 59));
    if (acceptedAt < confirmedAt) acceptedAt = addMinutes(confirmedAt, 10);
    history.push({
      at: acceptedAt,
      by: worker.username,
      type: 'accepted',
      text: `${worker.username} รับ Order (โรงงาน)`,
    });
  }
  if (rank >= 3) {
    shippedAt = thaiTime(roundDate, rng.int(15, 17), rng.int(0, 59));
    trackingSource = carrier?.hasApi ? 'api' : 'manual';
    tracking = carrier?.hasApi
      ? `${carrier.trackingPrefix}${rng.int(10000000, 99999999)}`
      : `${carrier?.trackingPrefix ?? 'TRK-'}${dayjs(roundDate).format('DDMM')}-${String(rng.int(1, 30)).padStart(2, '0')}`;
    history.push({
      at: shippedAt,
      by: trackingSource === 'api' ? `ระบบ (${carrier?.name ?? ''})` : worker.username,
      type: 'shipped',
      text: `บันทึก Tracking ${tracking} · จัดส่งแล้ว`,
    });
  }
  if (status === 'partially_shipped' && lines[0]) {
    const first = lines[0];
    const missing = first.productId === TOFU_ID ? rng.int(1, 3) * 5 : 1;
    first.shippedQty = Math.max(0, first.qty - Math.min(missing, first.qty));
    history.push({
      at: addMinutes(shippedAt ?? orderedAt, 5),
      by: worker.username,
      type: 'short',
      text: `ส่งไม่ครบ ${first.name} ขาด ${first.qty - first.shippedQty}`,
    });
  }
  if (rank >= 4) {
    deliveredAt = thaiTime(addDays(roundDate, rng.int(1, 3)), rng.int(9, 18), rng.int(0, 59));
    if (deliveredAt > thaiTime(today, 23, 59)) deliveredAt = thaiTime(today, 9, rng.int(0, 59));
    history.push({
      at: deliveredAt,
      by: carrier?.hasApi ? `ระบบ (${carrier.name})` : worker.username,
      type: 'delivered',
      text: 'จัดส่งสำเร็จ',
    });
  }

  let cancelReason: string | undefined;
  let cancelledAt: string | undefined;
  if (cancelled && rank <= 2) {
    // Only cancel orders that have not shipped yet
    cancelReason = rng.pick(CANCEL_REASONS_MOCK);
    cancelledAt = addMinutes(acceptedAt ?? confirmedAt, rng.int(10, 240));
    history.push({
      at: cancelledAt,
      by: marketplace ? `ระบบ (${PLATFORM_OF[channel] ?? ''})` : seller.username,
      type: 'cancelled',
      text: `ยกเลิก Order · ${cancelReason}`,
    });
    status = 'cancelled';
  }

  const editedAfterAccept = status === 'factory_accepted' && !marketplace && rng.chance(0.15);
  if (editedAfterAccept && acceptedAt && lines[0]) {
    const old = lines[0].qty;
    lines[0].qty += lines[0].productId === TOFU_ID ? 10 : 1;
    priceLines(lines, channel, group);
    history.push({
      at: addMinutes(acceptedAt, rng.int(5, 40)),
      by: seller.username,
      type: 'edited',
      text: `${seller.username} แก้ไขจำนวน ${lines[0].name}: ${old} → ${lines[0].qty} (หลังโรงงานรับ)`,
    });
  }

  const delivery: MockOrder['delivery'] =
    status === 'cancelled' || rank <= 1
      ? 'none'
      : rank === 2
        ? 'waiting'
        : rank === 3
          ? 'in_transit'
          : 'delivered';
  const sync: MockOrder['sync'] = !marketplace
    ? 'none'
    : rank === 2 && status !== 'cancelled'
      ? 'waiting'
      : rank >= 3
        ? rng.chance(0.015)
          ? 'error'
          : 'ok'
        : 'none';

  let revenue: MockOrder['revenue'];
  if (rank >= 1 && status !== 'cancelled') {
    const missingTax = customer.billing === 'VAT' && !customer.taxId;
    revenue = missingTax
      ? { state: 'err', at: confirmedAt, error: 'ไม่มีเลขผู้เสียภาษี' }
      : { state: d <= -3 ? 'sent' : 'wait', at: confirmedAt };
  }

  const finalLines = lines;
  return {
    sortKey: orderedAt,
    platformOrderNo: marketplace
      ? `${dayjs(date).format('YYMMDD')}${rng.int(100, 999)}${String.fromCharCode(65 + rng.int(0, 25))}${String.fromCharCode(65 + rng.int(0, 25))}${rng.int(10, 99)}`
      : undefined,
    channel,
    orderedAt,
    orderDate: date,
    roundDate,
    customerId: customer.id,
    customerName: customer.name,
    phone: addr?.phone ?? customer.phone,
    address: addr?.text ?? '',
    billing: customer.billing,
    lines: finalLines,
    shippingFee,
    total: sum(finalLines) + shippingFee,
    paymentMethod,
    payment,
    paidAt,
    carrierId,
    status,
    delivery,
    tracking: status === 'cancelled' ? undefined : tracking,
    trackingSource: status === 'cancelled' ? undefined : trackingSource,
    sync,
    acceptedAt,
    shippedAt,
    deliveredAt,
    cancelledAt,
    cancelReason,
    insertedAfterCutoff: insertedAfterCutoff || undefined,
    editedAfterAccept: editedAfterAccept || undefined,
    revenue,
    printed: {
      pickList: rank >= 3 ? 1 : rank === 2 && rng.chance(0.6) ? 1 : 0,
      label: rank >= 3 ? 1 : rank === 2 && rng.chance(0.4) ? 1 : 0,
    },
    createdBy,
    history: history.toSorted((a, b) => a.at.localeCompare(b.at)),
  };
}

export function channelText(channel: Channel): string {
  const labels: Record<Channel, string> = {
    shopee: 'Shopee',
    lazada: 'Lazada',
    tiktok: 'TikTok',
    line: 'Line',
    facebook: 'Facebook',
    storefront: 'หน้าร้าน',
    phone: 'โทร',
  };
  return labels[channel];
}

/** YYMM part of document numbers, e.g. 2611 */
function docPeriod(at: string): string {
  return dayjs(at).format('YYMM');
}

function generateDocuments(
  rng: Rng,
  orders: MockOrder[],
  customers: MockCustomer[],
  today: string,
) {
  const documents: MockDocument[] = [];
  const counters: Record<string, number> = {};
  const nextNo = (prefix: string, at: string) => {
    const key = `${prefix}-${docPeriod(at)}`;
    counters[key] = (counters[key] ?? 0) + 1;
    return `${key}-${String(counters[key]).padStart(4, '0')}`;
  };
  const shipped = orders
    .filter((o) => o.shippedAt && diffDays(o.roundDate, today) <= -2)
    .toSorted((a, b) => (a.shippedAt ?? '').localeCompare(b.shippedAt ?? ''));
  for (const o of shipped) {
    const issuedAt = thaiTime(addDays(o.roundDate, 1), 10, rng.int(0, 59));
    const customer = customers.find((c) => c.id === o.customerId);
    const vat = o.billing === 'VAT';
    const kind = vat ? 'inv' : 'rc';
    documents.push({
      no: nextNo(vat ? 'INV' : 'RC', issuedAt),
      kind,
      type: vat ? (customer?.taxId ? 'ใบกำกับเต็มรูป' : 'ใบกำกับอย่างย่อ') : 'ใบเสร็จรับเงิน',
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      billing: o.billing,
      total: o.total,
      issuedAt,
    });
    o.history.push({
      at: issuedAt,
      by: 'acc01',
      type: 'invoiced',
      text: `ออกเอกสาร ${documents[documents.length - 1]?.no ?? ''}`,
    });
  }

  // Credit notes against a few issued documents (partial returns / discounts); one is voided
  const creditNotes: MockCreditNote[] = [];
  const candidates = documents.filter((d) => d.total >= 300);
  const reasons = ['คืนสินค้าบางส่วน', 'ลดราคา', 'สินค้าเสียหายระหว่างขนส่ง', 'คืนสินค้าบางส่วน'];
  const picks = Math.min(4, candidates.length);
  for (let i = 0; i < picks; i++) {
    const doc = candidates[Math.floor(((i + 1) * candidates.length) / (picks + 1))];
    if (!doc || creditNotes.some((c) => c.invoiceNo === doc.no)) continue;
    const issuedAt = addMinutes(doc.issuedAt, rng.int(1, 4) * 24 * 60);
    if (issuedAt.slice(0, 10) > today) continue;
    creditNotes.push({
      no: nextNo('CN', issuedAt),
      invoiceNo: doc.no,
      orderNumber: doc.orderNumber,
      customerName: doc.customerName,
      reason: reasons[i] ?? 'ลดราคา',
      total: Math.min(doc.total, rng.pick([100, 125, 190, 250, 380])),
      issuedAt,
      voided: i === picks - 1,
    });
  }

  // One shipped order cancelled after its invoice — the credit notes page asks to issue one
  const lateCancel = orders.find(
    (o) =>
      o.status === 'shipped' &&
      documents.some((d) => d.orderNumber === o.orderNumber) &&
      !creditNotes.some((c) => c.orderNumber === o.orderNumber),
  );
  if (lateCancel) {
    lateCancel.status = 'cancelled';
    lateCancel.delivery = 'none';
    lateCancel.cancelReason = 'ลูกค้าปฏิเสธรับสินค้า';
    lateCancel.cancelledAt = thaiTime(today, 9, 30);
    lateCancel.history.push({
      at: lateCancel.cancelledAt,
      by: 'head01',
      type: 'cancelled',
      text: 'ยกเลิก Order หลังออกบิล · ลูกค้าปฏิเสธรับสินค้า',
    });
  }

  return { documents, creditNotes };
}

function generateSettlements(rng: Rng, orders: MockOrder[], today: string): MockSettlement[] {
  const rows: MockSettlement[] = [];
  for (const o of orders) {
    const rate = PLATFORM_FEE_RATE[o.channel];
    if (rate === undefined || o.status !== 'delivered' || !o.platformOrderNo) continue;
    // Payout cycles: rounds 1–15 paid on the 16th, rounds 16–end paid on the 1st of next month
    const day = dayjs(o.roundDate).date();
    const paidDate =
      day <= 15
        ? dayjs(o.roundDate).date(16).format('YYYY-MM-DD')
        : dayjs(o.roundDate).add(1, 'month').date(1).format('YYYY-MM-DD');
    if (paidDate > today) continue;
    const amount = o.total;
    const fee = -Math.round(amount * rate * 100) / 100;
    // The platform keeps the shipping fee the buyer paid
    const shipping = -o.shippingFee;
    const expected = Math.round((amount + fee + shipping) * 100) / 100;
    const received = rng.chance(0.015)
      ? Math.round((expected - rng.int(10, 60)) * 100) / 100
      : expected;
    rows.push({
      orderNumber: o.orderNumber,
      platformOrderNo: o.platformOrderNo,
      channel: o.channel,
      paidAt: paidDate,
      amount,
      fee,
      shipping,
      received,
    });
  }
  return rows;
}

function generatePlatformLogs(
  rng: Rng,
  orders: MockOrder[],
  from: string,
  to: string,
  today: string,
): MockPlatformLog[] {
  const logs: MockPlatformLog[] = [];
  const platforms: [PlatformName, Channel][] = [
    ['Shopee', 'shopee'],
    ['Lazada', 'lazada'],
    ['TikTok Shop', 'tiktok'],
  ];
  const hours = [8, 11, 14, 17, 20];
  const last = to < today ? to : today;
  for (let date = from; date <= last; date = addDays(date, 1)) {
    for (const hour of hours) {
      const at = thaiTime(date, hour, 0);
      const prev =
        hour === hours[0]
          ? thaiTime(addDays(date, -1), 20, 0)
          : thaiTime(date, hours[hours.indexOf(hour) - 1] ?? 0, 0);
      for (const [platform, channel] of platforms) {
        const count = orders.filter(
          (o) => o.channel === channel && o.orderedAt > prev && o.orderedAt <= at,
        ).length;
        const ok = !rng.chance(0.02);
        logs.push({
          id: `L-${date}-${hour}-${channel}`,
          at,
          platform,
          action: 'ดึง Order',
          ok,
          count: ok ? count : 0,
          message: ok
            ? `ดึง Order ใหม่ ${count} รายการ`
            : rng.pick([
                'API timeout (30s)',
                'Token หมดอายุ · ต้องเชื่อมต่อใหม่',
                'Rate limit · ลองใหม่อัตโนมัติ',
              ]),
        });
      }
    }
  }
  return logs.toSorted((a, b) => b.at.localeCompare(a.at));
}

function generateUnmapped(rng: Rng, orders: MockOrder[]): MockUnmappedSku[] {
  const pending = orders
    .filter((o) => o.status === 'pending_review' && o.platformOrderNo)
    .slice(-3);
  return pending.map((o, i) => ({
    id: `UM-${i + 1}`,
    platform: PLATFORM_OF[o.channel] ?? 'Shopee',
    sku: `${o.channel.toUpperCase().slice(0, 2)}-${rng.pick(['TOFU10-PROMO', 'SAUCE400-SET2', 'TOFU-BUNDLE3'])}`,
    name: rng.pick(['เต้าหู้คลองแงะ โปร 2 แพ็ค', 'เซ็ตน้ำจิ้ม 2 ขวด', 'เต้าหู้ 3 แพ็ค + น้ำจิ้ม']),
    orderNumber: o.orderNumber,
    at: o.orderedAt,
  }));
}

function generateStockReceipts(
  rng: Rng,
  orders: MockOrder[],
  from: string,
  to: string,
  today: string,
): MockStockReceipt[] {
  const receipts: MockStockReceipt[] = [];
  const last = to < today ? to : today;
  for (const p of MOCK_PRODUCTS) {
    receipts.push({
      id: `R-${p.id}-open`,
      at: thaiTime(from, 6, 0),
      productId: p.id,
      qty: p.kind === 'tofu' ? 2000 : 150,
      lot: 'ยอดยกมา',
      by: 'admin',
    });
  }
  for (let date = from; date <= last; date = addDays(date, 1)) {
    for (const p of MOCK_PRODUCTS) {
      const demand = orders
        .filter((o) => o.roundDate === date && o.status !== 'cancelled')
        .reduce(
          (s, o) => s + o.lines.filter((l) => l.productId === p.id).reduce((q, l) => q + l.qty, 0),
          0,
        );
      if (demand === 0) continue;
      const qty = Math.ceil((demand * rng.int(95, 115)) / 100 / 10) * 10;
      receipts.push({
        id: `R-${p.id}-${date}`,
        at: thaiTime(date, 7, rng.int(0, 45)),
        productId: p.id,
        qty,
        lot: `LOT-${dayjs(date).format('YYMMDD')}-${p.kind === 'tofu' ? 'T' : 'S'}`,
        by: rng.pick(factory).username,
      });
    }
  }
  return receipts;
}

/** Build a complete mock database for the given settings (deterministic for the same seed and today) */
export function generateMockDb(
  settings: MockSettings = DEFAULT_SETTINGS,
  today: string = todayIso(),
): MockDb {
  const rng = createRng(settings.seed);
  const customers = generateCustomers(rng);
  const min = Math.max(0, Math.min(settings.minPerDay, settings.maxPerDay));
  const max = Math.max(settings.minPerDay, settings.maxPerDay);

  const drafts: DraftOrder[] = [];
  for (let date = settings.from; date <= settings.to; date = addDays(date, 1)) {
    const n = rng.int(min, max);
    for (let i = 0; i < n; i++) drafts.push(buildOrder(rng, date, today, customers));
  }
  const orders: MockOrder[] = drafts
    .toSorted((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey: _sortKey, ...o }, i) => ({
      orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
      ...o,
    }));

  const { documents, creditNotes } = generateDocuments(rng, orders, customers, today);
  for (const o of orders) o.history = o.history.toSorted((a, b) => a.at.localeCompare(b.at));

  return {
    version: MOCK_DB_VERSION,
    generatedAt: dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ssZ'),
    settings,
    cleared: false,
    products: structuredClone(MOCK_PRODUCTS),
    priceRules: structuredClone(DEFAULT_PRICE_RULES),
    shippingRules: structuredClone(DEFAULT_SHIPPING_RULES),
    carriers: structuredClone(MOCK_CARRIERS),
    customers,
    users: structuredClone(MOCK_USERS).map((u) => ({
      ...u,
      lastLoginAt: u.active
        ? thaiTime(today, rng.int(7, 10), rng.int(0, 59))
        : thaiTime(settings.from, 9, 0),
    })),
    orders,
    documents,
    creditNotes,
    settlements: generateSettlements(rng, orders, today),
    platformLogs: generatePlatformLogs(rng, orders, settings.from, settings.to, today),
    unmappedSkus: generateUnmapped(rng, orders),
    stockReceipts: generateStockReceipts(rng, orders, settings.from, settings.to, today),
  };
}

/** Empty all transactions but keep master data (products, carriers, customers, users) */
export function clearTransactions(db: MockDb): MockDb {
  return {
    ...db,
    generatedAt: dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ssZ'),
    cleared: true,
    orders: [],
    documents: [],
    creditNotes: [],
    settlements: [],
    platformLogs: [],
    unmappedSkus: [],
    stockReceipts: [],
  };
}
