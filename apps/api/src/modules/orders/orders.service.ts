import { Injectable } from '@nestjs/common';
import type { OrderListQuery } from '@sahasa/shared';

@Injectable()
export class OrdersService {
  /** TODO: query ตาราง orders หลังออกแบบ database เสร็จ */
  list(query: OrderListQuery) {
    return { items: [], total: 0, page: query.page, pageSize: query.pageSize };
  }
}
