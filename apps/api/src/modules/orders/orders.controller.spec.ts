import { Test } from '@nestjs/testing';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService],
    }).compile();
    controller = moduleRef.get(OrdersController);
  });

  it('คืนหน้าและขนาดหน้าตาม query', () => {
    const result = controller.list({ page: 2, pageSize: 50, sort: 'createdAt', order: 'desc' });
    expect(result).toMatchObject({ page: 2, pageSize: 50, total: 0 });
  });
});
