import type { Channel, OrderListQuery } from '@sahasa/shared';
import { todayIso } from '@/lib/dayjs';

/** Order list filter for one sales channel on one order date (defaults to today, Thai time) */
export function ordersByChannelOnDateSearch(
  channel: Channel,
  date: string = todayIso(),
): Pick<OrderListQuery, 'channel' | 'orderDateFrom' | 'orderDateTo'> {
  return { channel, orderDateFrom: date, orderDateTo: date };
}
