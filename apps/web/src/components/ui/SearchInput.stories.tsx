import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'UI/SearchInput',
  component: SearchInput,
  args: { value: '', onSearch: fn(), placeholder: 'ค้นหาเลข Order, ชื่อลูกค้า', delay: 100 },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchWhileTyping: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByPlaceholderText('ค้นหาเลข Order, ชื่อลูกค้า');
    await userEvent.type(input, 'ORD-0001');
    // Debounced: reports once with the full text, not per keystroke
    await waitFor(() => expect(args.onSearch).toHaveBeenLastCalledWith('ORD-0001'));
    await expect(args.onSearch).toHaveBeenCalledTimes(1);
  },
};

export const ClearWithButton: Story = {
  args: { value: 'สมชาย' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'ล้างคำค้นหา' }));
    await expect(args.onSearch).toHaveBeenCalledWith('');
    await expect(canvas.getByPlaceholderText('ค้นหาเลข Order, ชื่อลูกค้า')).toHaveValue('');
  },
};

export const ClearWithEscape: Story = {
  args: { value: 'สมชาย' },
  play: async ({ canvas, args }) => {
    const input = canvas.getByPlaceholderText('ค้นหาเลข Order, ชื่อลูกค้า');
    await userEvent.type(input, '{Escape}');
    await expect(args.onSearch).toHaveBeenCalledWith('');
    await expect(input).toHaveValue('');
  },
};
