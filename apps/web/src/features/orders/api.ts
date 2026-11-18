import type { OrderListQuery, OrderStatus } from '@sahasa/shared';
import { queryOptions } from '@tanstack/react-query';
import { api, toQueryString } from '@/lib/api-client';

// TODO: ย้าย type นี้ไป packages/shared เมื่อออกแบบตาราง orders เสร็จ
export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  total: string;
  shipDate: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const orderListQuery = (query: OrderListQuery) =>
  queryOptions({
    queryKey: ['orders', 'list', query],
    queryFn: () => api<Paged<OrderRow>>(`/orders${toQueryString(query)}`),
  });
