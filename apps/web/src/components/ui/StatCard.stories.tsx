import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { StatCard, StatGrid } from './StatCard';

const meta = {
  title: 'UI/StatCard',
  component: StatCard,
  args: { label: 'รอตรวจสอบ', value: 12, color: 'orange' },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('รอตรวจสอบ')).toBeInTheDocument();
    await expect(canvas.getByText('12')).toBeInTheDocument();
  },
};

export const Grid: Story = {
  render: () => (
    <StatGrid
      items={[
        { label: 'รอตรวจสอบ', value: 12, color: 'orange' },
        { label: 'ยืนยันแล้ว', value: 28, color: 'blue' },
        { label: 'จัดส่งสำเร็จ', value: 132, color: 'green' },
        { label: 'ยกเลิก', value: 3, color: 'brand' },
      ]}
    />
  ),
};
