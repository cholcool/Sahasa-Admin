import {
  Alert,
  Button,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { saveProduct, savePriceRule, saveShippingRule } from '@/features/mock/actions';
import { PRICE_GROUPS, REGION_LABEL } from '@/features/mock/pricing';
import { useMockDb } from '@/features/mock/store';
import type { MockProduct } from '@/features/mock/types';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { formatNumber } from '@/lib/format';

/** 08-01 Products, price rules and shipping fees (SRS 50; data from Project Detail › ราคาสินค้า) */
export const Route = createFileRoute('/_app/master/')({
  component: ProductsPage,
});

function PriceInput({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  return (
    <NumberInput
      size="xs"
      min={0}
      w={100}
      defaultValue={value}
      thousandSeparator
      aria-label="ราคา"
      onBlur={(e) => {
        const v = Number(e.currentTarget.value.replace(/,/g, ''));
        if (Number.isFinite(v) && v !== value) onSave(v);
      }}
      styles={{ input: { textAlign: 'right' } }}
    />
  );
}

function ProductsPage() {
  const db = useMockDb();
  const [editing, setEditing] = useState<MockProduct | 'new' | null>(null);
  const productName = (id: string) => db.products.find((p) => p.id === id)?.name ?? id;

  return (
    <Stack>
      <PageHeader
        title="สินค้า"
        description="รหัส ชื่อ หน่วย ราคาตามเงื่อนไข และค่าขนส่งเรียกเก็บ"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing('new')}>
            เพิ่มสินค้า
          </Button>
        }
      />
      <Alert color="blue" variant="light">
        ราคาและค่าส่งนำมาจาก Project Detail › ราคาสินค้า · แก้ตัวเลขในตารางแล้วกดออกจากช่อง
        ระบบจะใช้ราคาใหม่กับ Order ที่สร้างหรือแก้ไขหลังจากนี้
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
            {
              accessor: 'basePrice',
              title: 'ราคาตั้ง (บาท)',
              textAlign: 'right',
              render: (r) => formatNumber(r.basePrice),
            },
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

      <SectionCard title="ราคาตามเงื่อนไข">
        <DataTable
          withTableBorder
          borderRadius="md"
          records={db.priceRules}
          columns={[
            { accessor: 'sheetRow', title: 'แถว', width: 60 },
            { accessor: 'productId', title: 'สินค้า', render: (r) => productName(r.productId) },
            { accessor: 'condition', title: 'เงื่อนไข' },
            {
              accessor: 'applies',
              title: 'ใช้กับ',
              render: (r) =>
                r.priceGroup ? (
                  <StatusBadge color="gold">{PRICE_GROUPS[r.priceGroup]}</StatusBadge>
                ) : (
                  <Text size="xs">
                    {r.channels
                      ? r.channels.map((c) => CHANNEL_LABEL_TH[c]).join(', ')
                      : 'ทุกช่องทาง'}
                    {r.minQty > 1 && ` · ตั้งแต่ ${r.minQty} ชิ้น`}
                  </Text>
                ),
            },
            {
              accessor: 'price',
              title: 'ราคา (บาท)',
              textAlign: 'right',
              render: (r) => (
                <PriceInput
                  key={`${r.id}-${r.price}`}
                  value={r.price}
                  onSave={(v) => savePriceRule(r.id, v)}
                />
              ),
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="ค่าขนส่งเรียกเก็บ">
        <DataTable
          withTableBorder
          borderRadius="md"
          records={db.shippingRules}
          columns={[
            { accessor: 'sheetRow', title: 'แถว', width: 60 },
            { accessor: 'condition', title: 'เงื่อนไข' },
            {
              accessor: 'applies',
              title: 'ใช้กับ',
              render: (r) => (
                <Text size="xs">
                  {r.sauceOnly
                    ? 'Order ที่มีแต่น้ำจิ้ม'
                    : r.channels
                      ? r.channels.map((c) => CHANNEL_LABEL_TH[c]).join(', ')
                      : 'ทุกช่องทาง'}
                  {r.region && ` · ${REGION_LABEL[r.region]}`}
                </Text>
              ),
            },
            {
              accessor: 'fee',
              title: 'ค่าส่ง (บาท/ครั้ง)',
              textAlign: 'right',
              render: (r) => (
                <PriceInput
                  key={`${r.id}-${r.fee}`}
                  value={r.fee}
                  onSave={(v) => saveShippingRule(r.id, v)}
                />
              ),
            },
          ]}
        />
        <Text size="xs" c="dimmed" mt="xs">
          หน้าร้าน / รับที่ร้าน ไม่คิดค่าส่ง · Lazada นอก กทม./ภาคใต้ ไม่มีในตาราง ใช้ 100 บาทไปก่อน
        </Text>
      </SectionCard>

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
        unit: 'ชิ้น',
        basePrice: 0,
        active: true,
      },
  );

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
          data={['ชิ้น', 'ชุด', 'กิโลกรัม', 'แพ็ค', 'ขวด']}
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
        <NumberInput
          label="ราคาตั้ง (บาท/หน่วย)"
          description="ใช้เมื่อไม่มีราคาตามเงื่อนไข"
          min={0}
          value={form.basePrice}
          onChange={(v) => setForm({ ...form, basePrice: Number(v) || 0 })}
        />
      </SimpleGrid>
      <Switch
        label="เปิดขาย"
        checked={form.active}
        onChange={(e) => setForm({ ...form, active: e.currentTarget.checked })}
      />
    </ConfirmModal>
  );
}
