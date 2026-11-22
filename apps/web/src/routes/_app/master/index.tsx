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
import { formatNumber } from '@/lib/format';

/** 08-01 Products with per-channel prices (SRS 50) */
export const Route = createFileRoute('/_app/master/')({
  component: ProductsPage,
});

interface ProductRow {
  id: string;
  name: string;
  unit: string;
  prices: { storefront: number; shopee: number; tiktok: number; lazada: number; lineFb: number };
  active: boolean;
}

// TODO: replace with products API
const PRODUCTS: ProductRow[] = [
  {
    id: 'PRD-001',
    name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น',
    unit: 'แพ็ค',
    prices: { storefront: 170, shopee: 190, tiktok: 189, lazada: 195, lineFb: 190 },
    active: true,
  },
  {
    id: 'PRD-002',
    name: 'น้ำจิ้ม 400g',
    unit: 'ขวด',
    prices: { storefront: 115, shopee: 125, tiktok: 125, lazada: 129, lineFb: 125 },
    active: true,
  },
];

const PRICE_ROWS = [
  { channel: 'หน้าร้าน', price: 170, shipping: 0 },
  { channel: 'Shopee', price: 190, shipping: 50 },
  { channel: 'TikTok', price: 189, shipping: 50 },
  { channel: 'Lazada', price: 195, shipping: 50 },
  { channel: 'Line', price: 190, shipping: 50 },
  { channel: 'Facebook', price: 190, shipping: 50 },
  { channel: 'โทร', price: 190, shipping: 50 },
];

function ProductsPage() {
  const [editing, setEditing] = useState<ProductRow | 'new' | null>(null);
  const product = editing === 'new' ? null : editing;

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
          records={PRODUCTS}
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
            {
              accessor: 'prices.storefront',
              title: 'หน้าร้าน',
              textAlign: 'right',
              render: (r) => formatNumber(r.prices.storefront),
            },
            {
              accessor: 'prices.shopee',
              title: 'Shopee',
              textAlign: 'right',
              render: (r) => formatNumber(r.prices.shopee),
            },
            {
              accessor: 'prices.tiktok',
              title: 'TikTok',
              textAlign: 'right',
              render: (r) => formatNumber(r.prices.tiktok),
            },
            {
              accessor: 'prices.lazada',
              title: 'Lazada',
              textAlign: 'right',
              render: (r) => formatNumber(r.prices.lazada),
            },
            {
              accessor: 'prices.lineFb',
              title: 'Line/FB',
              textAlign: 'right',
              render: (r) => formatNumber(r.prices.lineFb),
            },
            {
              accessor: 'active',
              title: 'ใช้งาน',
              render: (r) => <Switch defaultChecked={r.active} aria-label="เปิดขาย" />,
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

      <ConfirmModal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={product ? `แก้ไขสินค้า · ${product.id}` : 'เพิ่มสินค้า'}
        confirmLabel="บันทึก"
        doneMessage="บันทึกสินค้าแล้ว"
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="รหัสสินค้า" withAsterisk defaultValue={product?.id} />
          <Select
            label="หน่วย"
            data={['แพ็ค', 'ขวด', 'กล่อง']}
            defaultValue={product?.unit ?? 'แพ็ค'}
          />
          <TextInput
            label="ชื่อสินค้า"
            withAsterisk
            defaultValue={product?.name}
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
              <Table.Tr key={p.channel}>
                <Table.Td>{p.channel}</Table.Td>
                <Table.Td>
                  <NumberInput size="xs" min={0} defaultValue={product ? p.price : undefined} />
                </Table.Td>
                <Table.Td>
                  <NumberInput size="xs" min={0} defaultValue={product ? p.shipping : undefined} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Text size="xs" c="dimmed">
          ราคาขายส่ง/ราคาพิเศษรายลูกค้า รอยืนยัน (Q5)
        </Text>
        <Switch label="เปิดขาย" defaultChecked />
      </ConfirmModal>
    </Stack>
  );
}
