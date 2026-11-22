import { Paper, Stepper } from '@mantine/core';
import { ORDER_STATUS_LABEL_TH, type OrderStatus } from '@sahasa/shared';

/** The 5 main steps of an order (SRS 9). Cancelled / partial statuses are shown as badges instead. */
const STEPS: OrderStatus[] = [
  'pending_review',
  'confirmed',
  'factory_accepted',
  'shipped',
  'delivered',
];

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const index = STEPS.indexOf(status === 'partially_shipped' ? 'shipped' : status);
  return (
    <Paper withBorder radius="lg" p="md">
      <Stepper active={Math.max(index, 0)} size="sm">
        {STEPS.map((s) => (
          <Stepper.Step key={s} label={ORDER_STATUS_LABEL_TH[s]} />
        ))}
      </Stepper>
    </Paper>
  );
}
