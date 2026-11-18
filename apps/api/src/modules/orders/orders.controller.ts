import { Controller, Get, Query } from '@nestjs/common';
import { orderListQuerySchema, type OrderListQuery } from '@sahasa/shared';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  /** schema เดียวกับที่หน้าเว็บใช้ตรวจ URL (packages/shared) */
  @Get()
  list(@Query({ schema: orderListQuerySchema }) query: OrderListQuery) {
    return this.orders.list(query);
  }
}
