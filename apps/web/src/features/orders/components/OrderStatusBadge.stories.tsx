import { Group } from '@mantine/core';
import { ORDER_STATUSES } from '@sahasa/shared';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { OrderStatusBadge } from './OrderStatusBadge';

const meta = {
  title: 'Orders/OrderStatusBadge',
  component: OrderStatusBadge,
  args: { status: 'confirmed' },
} satisfies Meta<typeof OrderStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmed: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('ยืนยันแล้ว')).toBeInTheDocument();
  },
};

export const AllStatuses: Story = {
  render: () => (
    <Group>
      {ORDER_STATUSES.map((s) => (
        <OrderStatusBadge key={s} status={s} />
      ))}
    </Group>
  ),
};
