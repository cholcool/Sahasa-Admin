import {
  ActionIcon,
  Combobox,
  Group,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { lineTotal } from '@/features/orders/order-math';
import type { Product } from '@/features/orders/mock-data';
import { formatBaht, formatNumber } from '@/lib/format';

export interface EditableLine {
  productId: string;
  name: string;
  unit: string;
  basePrice: number;
  qty: number;
  price: number;
}

interface LineItemsEditorProps {
  lines: EditableLine[];
  onChange: (lines: EditableLine[]) => void;
  products: Product[];
  /** Allow editing the unit price (create page). Edit page only changes quantity. */
  editablePrice?: boolean;
  disabled?: boolean;
}

/** Product search + editable line table used by create/edit order */
export function LineItemsEditor({
  lines,
  onChange,
  products,
  editablePrice = true,
  disabled,
}: LineItemsEditorProps) {
  const [query, setQuery] = useState('');
  const combobox = useCombobox();
  const q = query.trim().toLowerCase();
  const options = products.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
  );

  const update = (id: string, patch: Partial<EditableLine>) =>
    onChange(lines.map((l) => (l.productId === id ? { ...l, ...patch } : l)));

  const add = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    if (lines.some((l) => l.productId === id)) {
      update(id, { qty: (lines.find((l) => l.productId === id)?.qty ?? 0) + 1 });
    } else {
      onChange([
        ...lines,
        { productId: p.id, name: p.name, unit: p.unit, basePrice: p.price, qty: 1, price: p.price },
      ]);
    }
    setQuery('');
    combobox.closeDropdown();
  };

  return (
    <Stack>
      {!disabled && (
        <Combobox store={combobox} onOptionSubmit={add}>
          <Combobox.Target>
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาสินค้าด้วยชื่อหรือรหัส เช่น เต้าหู้, PRD-002"
              value={query}
              onChange={(e) => {
                setQuery(e.currentTarget.value);
                combobox.openDropdown();
              }}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              {options.length === 0 ? (
                <Combobox.Empty>ไม่พบสินค้า</Combobox.Empty>
              ) : (
                options.map((p) => (
                  <Combobox.Option key={p.id} value={p.id}>
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Text size="sm" fw={600}>
                          {p.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {p.id} · {p.unit}
                          {lines.some((l) => l.productId === p.id) && ' · เลือกแล้ว'}
                        </Text>
                      </div>
                      <Text size="sm" fw={600}>
                        {formatBaht(p.price)}
                      </Text>
                    </Group>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      )}

      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>สินค้า</Table.Th>
              <Table.Th ta="center">จำนวน</Table.Th>
              <Table.Th ta="right">ราคา/หน่วย (฿)</Table.Th>
              <Table.Th ta="right">รวม (฿)</Table.Th>
              <Table.Th w={40} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="md">
                    ยังไม่มีสินค้า · พิมพ์ค้นหาด้านบนเพื่อเพิ่ม
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {lines.map((l) => (
              <Table.Tr key={l.productId}>
                <Table.Td>
                  <Text fw={600} size="sm">
                    {l.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {l.productId} · {l.unit} · ราคาตั้ง {formatBaht(l.basePrice)}
                  </Text>
                </Table.Td>
                <Table.Td w={130}>
                  <NumberInput
                    min={1}
                    value={l.qty}
                    disabled={disabled}
                    onChange={(v) => update(l.productId, { qty: Number(v) || 0 })}
                  />
                </Table.Td>
                <Table.Td w={140}>
                  {editablePrice ? (
                    <NumberInput
                      min={0}
                      value={l.price}
                      disabled={disabled}
                      onChange={(v) => update(l.productId, { price: Number(v) || 0 })}
                      // Orange border when the price differs from the list price
                      error={l.price !== l.basePrice ? ' ' : undefined}
                      styles={{ input: { textAlign: 'right' } }}
                    />
                  ) : (
                    <Text ta="right">{formatNumber(l.price)}</Text>
                  )}
                </Table.Td>
                <Table.Td ta="right" fw={600}>
                  {formatNumber(lineTotal(l))}
                </Table.Td>
                <Table.Td>
                  {!disabled && (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      aria-label="ลบสินค้า"
                      onClick={() => onChange(lines.filter((x) => x.productId !== l.productId))}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}
