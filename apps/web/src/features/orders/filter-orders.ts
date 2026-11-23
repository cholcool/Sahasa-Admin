import type { Channel, OrderListQuery, OrderStatus } from '@sahasa/shared';

type OrderFilter = Pick<
  OrderListQuery,
  'q' | 'status' | 'channel' | 'orderDateFrom' | 'orderDateTo'
>;

/** Fields the order list filters on */
export interface FilterableOrder {
  orderNumber: string;
  customerName: string;
  phone?: string;
  channel: Channel;
  status: OrderStatus;
  orderDate: string;
}

/**
 * Client-side filter for the mock order list (same rules the orders API will apply).
 * Dates are YYYY-MM-DD strings, so plain string comparison is enough.
 */
export function filterOrders<T extends FilterableOrder>(orders: T[], filter: OrderFilter): T[] {
  const q = filter.q?.toLowerCase();
  return orders.filter(
    (o) =>
      (!filter.status || o.status === filter.status) &&
      (!filter.channel || o.channel === filter.channel) &&
      (!filter.orderDateFrom || o.orderDate >= filter.orderDateFrom) &&
      (!filter.orderDateTo || o.orderDate <= filter.orderDateTo) &&
      (!q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.phone?.replace(/-/g, '').includes(q.replace(/-/g, '')) ?? false)),
  );
}
