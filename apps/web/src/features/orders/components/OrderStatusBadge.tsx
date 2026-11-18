import { Badge, type MantineColor } from '@mantine/core';
import { ORDER_STATUS_LABEL_TH, type OrderStatus } from '@sahasa/shared';

const STATUS_COLOR: Record<OrderStatus, MantineColor> = {
  pending_review: 'gray',
  confirmed: 'blue',
  factory_accepted: 'gold',
  partially_shipped: 'orange',
  shipped: 'cyan',
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
