import {
  Alert,
  Button,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { saveProduct } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import type { ChannelPrices, MockProduct } from '@/features/mock/types';
import { formatNumber } from '@/lib/format';

/** 08-01 Products with per-channel prices (SRS 50) */
export const Route = createFileRoute('/_app/master/')({
  component: ProductsPage,
});

const PRICE_ROWS: { key: keyof ChannelPrices; channel: string; shipping: number }[] = [
  { key: 'storefront', channel: 'หน้าร้าน', shipping: 0 },
  { key: 'shopee', channel: 'Shopee', shipping: 50 },
  { key: 'tiktok', channel: 'TikTok', shipping: 50 },
  { key: 'lazada', channel: 'Lazada', shipping: 50 },
  { key: 'lineFb', channel: 'Line / Facebook / โทร', shipping: 50 },
];

function ProductsPage() {
  const db = useMockDb();
  const [editing, setEditing] = useState<MockProduct | 'new' | null>(null);

  return (
    <Stack>
      <PageHeader
        title="สินค้า"
        description="รหัส ชื่อ หน่วย และราคาแยกตามช่องทาง"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing('new')}>
            เพิ่มสินค้า
          </Button>
        }
      />
      <Alert color="orange" variant="light">
        โครงสร้างราคาแต่ละช่องทาง ค่าส่ง และราคาขายส่ง รอยืนยัน (Q2, Q5, Q18)
      </Alert>
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          records={db.products}
          columns={[
            {
              accessor: 'id',
              title: 'รหัส',
              render: (r) => (
                <Text ff="monospace" fw={700} size="sm">
                  {r.id}
                </Text>
              ),
            },
            { accessor: 'name', title: 'ชื่อสินค้า' },
            { accessor: 'unit', title: 'หน่วย' },
            ...PRICE_ROWS.map((p) => ({
              accessor: `prices.${p.key}`,
              title: p.key === 'lineFb' ? 'Line/FB' : p.channel,
              textAlign: 'right' as const,
              render: (r: MockProduct) => formatNumber(r.prices[p.key]),
            })),
            {
              accessor: 'active',
              title: 'ใช้งาน',
              render: (r) => (
                <Switch
                  checked={r.active}
                  onChange={(e) => saveProduct({ ...r, active: e.currentTarget.checked })}
                  aria-label="เปิดขาย"
                />
              ),
            },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (r) => (
                <Button size="compact-xs" variant="default" onClick={() => setEditing(r)}>
                  แก้ไข
                </Button>
              ),
            },
          ]}
        />
      </Paper>

      {editing && (
        <ProductModal
          product={editing === 'new' ? null : editing}
          nextId={`PRD-${String(db.products.length + 1).padStart(3, '0')}`}
          onClose={() => setEditing(null)}
        />
      )}
    </Stack>
  );
}

function ProductModal({
  product,
  nextId,
  onClose,
}: {
  product: MockProduct | null;
  nextId: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MockProduct>(
    () =>
      product ?? {
        id: nextId,
        name: '',
        shortName: '',
        kind: 'tofu',
        unit: 'แพ็ค',
        prices: { storefront: 0, shopee: 0, tiktok: 0, lazada: 0, lineFb: 0 },
        active: true,
      },
  );
  const setPrice = (key: keyof ChannelPrices, v: number | string) =>
    setForm((f) => ({ ...f, prices: { ...f.prices, [key]: Number(v) || 0 } }));

  return (
    <ConfirmModal
      opened
      onClose={onClose}
      title={product ? `แก้ไขสินค้า · ${product.id}` : 'เพิ่มสินค้า'}
      confirmLabel="บันทึก"
      confirmDisabled={form.name.trim() === '' || form.id.trim() === ''}
      doneMessage="บันทึกสินค้าแล้ว"
      onConfirm={() =>
        saveProduct({ ...form, shortName: form.shortName || form.name.split(' ')[0] || form.name })
      }
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          label="รหัสสินค้า"
          withAsterisk
          value={form.id}
          disabled={product !== null}
          onChange={(e) => setForm({ ...form, id: e.currentTarget.value })}
        />
        <Select
          label="หน่วย"
          data={['แพ็ค', 'ขวด', 'กล่อง']}
          value={form.unit}
          onChange={(v) => v && setForm({ ...form, unit: v })}
        />
        <TextInput
          label="ชื่อสินค้า"
          withAsterisk
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          style={{ gridColumn: '1 / -1' }}
        />
      </SimpleGrid>
      <Text size="sm" fw={500}>
        ราคาแยกตามช่องทาง
      </Text>
      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ช่องทาง</Table.Th>
            <Table.Th>ราคาขาย (บาท)</Table.Th>
            <Table.Th>ค่าส่ง (บาท)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {PRICE_ROWS.map((p) => (
            <Table.Tr key={p.key}>
              <Table.Td>{p.channel}</Table.Td>
              <Table.Td>
                <NumberInput
                  size="xs"
                  min={0}
                  value={form.prices[p.key]}
                  onChange={(v) => setPrice(p.key, v)}
                />
              </Table.Td>
              <Table.Td>
                <NumberInput size="xs" min={0} value={p.shipping} disabled />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Text size="xs" c="dimmed">
        ค่าส่งต่อ Order ตั้งค่ากลาง (รอยืนยัน Q2–Q5) · ราคาขายส่ง/ราคาพิเศษรายลูกค้า รอยืนยัน (Q5)
      </Text>
      <Switch
        label="เปิดขาย"
        checked={form.active}
        onChange={(e) => setForm({ ...form, active: e.currentTarget.checked })}
      />
    </ConfirmModal>
  );
}
