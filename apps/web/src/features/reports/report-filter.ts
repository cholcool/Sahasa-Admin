import type { Channel } from '@sahasa/shared';
import { dayjs, formatThaiDate } from '@/lib/dayjs';
import type { MockOrder } from '@/features/mock/types';

/** Filters shared by the report pages */
export interface ReportFilter {
  /** Key of the selected period option */
  period: string;
  channel: Channel | null;
  productId: string | null;
}

export interface PeriodOption {
  value: string;
  label: string;
  from: string;
  to: string;
}

function fmt(from: string, to: string): string {
  return from === to
    ? formatThaiDate(from, 'D MMM BBBB')
    : `${formatThaiDate(from, 'D')}–${formatThaiDate(to, 'D MMM BBBB')}`;
}

/** Period choices built from the data range (YYYY-MM-DD) and today */
export function periodOptions(rangeFrom: string, rangeTo: string, today: string): PeriodOption[] {
  const options: PeriodOption[] = [
    { value: 'all', label: `ทั้งหมด (${fmt(rangeFrom, rangeTo)})`, from: rangeFrom, to: rangeTo },
  ];
  const monthStart = dayjs(today).startOf('month').format('YYYY-MM-DD');
  if (today >= rangeFrom && today <= rangeTo) {
    options.push({
      value: 'mtd',
      label: `ต้นเดือนถึงวันนี้ (${fmt(monthStart, today)})`,
      from: monthStart,
      to: today,
    });
    const week = dayjs(today).subtract(6, 'day').format('YYYY-MM-DD');
    options.push({ value: '7d', label: '7 วันล่าสุด', from: week, to: today });
    options.push({
      value: 'today',
      label: `วันนี้ (${formatThaiDate(today, 'D MMM')})`,
      from: today,
      to: today,
    });
  }
  const mid = dayjs(rangeFrom).date(15).format('YYYY-MM-DD');
  if (mid > rangeFrom && mid < rangeTo) {
    options.push({ value: 'h1', label: fmt(rangeFrom, mid), from: rangeFrom, to: mid });
    const next = dayjs(mid).add(1, 'day').format('YYYY-MM-DD');
    options.push({ value: 'h2', label: fmt(next, rangeTo), from: next, to: rangeTo });
  }
  return options;
}

/** Orders whose order date is in the period and match channel/product */
export function applyReportFilter(
  orders: MockOrder[],
  filter: ReportFilter,
  period: PeriodOption | undefined,
): MockOrder[] {
  return orders.filter(
    (o) =>
      (!period || (o.orderDate >= period.from && o.orderDate <= period.to)) &&
      (!filter.channel || o.channel === filter.channel) &&
      (!filter.productId || o.lines.some((l) => l.productId === filter.productId)),
  );
}
