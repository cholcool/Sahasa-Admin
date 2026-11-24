import { Badge, type MantineColor } from '@mantine/core';
import { ORDER_STATUS_LABEL_TH, type OrderStatus } from '@sahasa/shared';

// Colors follow UI Prototype/pages/03-01_order-list.html
export const ORDER_STATUS_COLOR: Record<OrderStatus, MantineColor> = {
  received: 'orange',
  awaiting_confirm: 'blue',
  in_production: 'gray',
  ready_to_ship: 'gold',
  in_transit: 'cyan',
  delivered: 'green',
  cancelled: 'brand',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge color={ORDER_STATUS_COLOR[status]} variant="light" radius="xl" tt="none" fw={500}>
      {ORDER_STATUS_LABEL_TH[status]}
    </Badge>
  );
}
