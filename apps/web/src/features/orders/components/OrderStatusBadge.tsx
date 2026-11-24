import { Badge, type MantineColor } from '@mantine/core';
import { ORDER_STATUS_LABEL_TH, type OrderStatus } from '@sahasa/shared';

const STATUS_COLOR: Record<OrderStatus, MantineColor> = {
  received: 'gray',
  awaiting_confirm: 'blue',
  in_production: 'gold',
  ready_to_ship: 'orange',
  in_transit: 'cyan',
  delivered: 'green',
  cancelled: 'brand',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge color={STATUS_COLOR[status]} variant="light">
      {ORDER_STATUS_LABEL_TH[status]}
    </Badge>
  );
}
