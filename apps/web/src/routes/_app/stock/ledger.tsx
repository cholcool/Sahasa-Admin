import { Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExportExcelButton } from '@/features/reports/components/ReportFilters';
import { StockDraftBanner } from '@/features/stock/components/StockDraftBanner';

/** 09-03 Stock movement ledger (SRS 59, draft) */
export const Route = createFileRoute('/_app/stock/ledger')({
  component: StockLedgerPage,
});

type MoveType = 'order' | 'waste' | 'receive' | 'adjust';

const TYPE: Record<MoveType, { label: string; color: string }> = {
  order: { label: 'ตัดจาก Order', color: 'blue' },
  waste: { label: 'ของเสีย', color: 'brand' },
  receive: { label: 'รับเข้า', color: 'green' },
  adjust: { label: 'ปรับยอด', color: 'orange' },
};

const MOVES = [
  {
    id: 1,
    at: '13 พ.ย. 10:42',
    type: 'order' as MoveType,
    ref: 'ORD-000141',
    product: 'เต้าหู้ แพ็ค 10',
    in: 0,
    out: 5,
    balance: 260,
    by: 'ระบบ',
  },
  {
    id: 2,
    at: '13 พ.ย. 08:10',
    type: 'waste' as MoveType,
    ref: 'ADJ-0031',
    product: 'เต้าหู้ แพ็ค 10',
    in: 0,
    out: 4,
    balance: 265,
    by: 'โรงงาน01',
  },
  {
    id: 3,
    at: '13 พ.ย. 06:30',
    type: 'receive' as MoveType,
    ref: 'L-261113-A',
    product: 'เต้าหู้ แพ็ค 10',
    in: 180,
    out: 0,
    balance: 269,
    by: 'โรงงาน01',
  },
  {
    id: 4,
    at: '12 พ.ย. 16:00',
    type: 'adjust' as MoveType,
    ref: 'ADJ-0030',
    product: 'น้ำจิ้ม 400g',
    in: 0,
    out: 2,
    balance: 410,
    by: 'Admin',
  },
];

function StockLedgerPage() {
  const [type, setType] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const rows = MOVES.filter(
    (m) => (!type || m.type === type) && (!product || m.product === product),
  );

  return (
    <Stack>
      <StockDraftBanner />
      <PageHeader
        title="ประวัติการเคลื่อนไหว"
        description="รายการเข้า-ออกของสินค้า"
        actions={<ExportExcelButton />}
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={220}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเอกสารอ้างอิง"
            />
            <Select
              placeholder="ทุกสินค้า"
              clearable
              data={['เต้าหู้ แพ็ค 10', 'น้ำจิ้ม 400g']}
              value={product}
              onChange={setProduct}
            />
            <Select
              placeholder="ทุกประเภท"
              clearable
              data={Object.entries(TYPE).map(([value, t]) => ({ value, label: t.label }))}
              value={type}
              onChange={setType}
            />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            records={rows}
            noRecordsText="ไม่มีรายการ"
            columns={[
              { accessor: 'at', title: 'วันเวลา' },
              {
                accessor: 'type',
                title: 'ประเภท',
                render: (r) => (
                  <StatusBadge color={TYPE[r.type].color}>{TYPE[r.type].label}</StatusBadge>
                ),
              },
              {
                accessor: 'ref',
                title: 'อ้างอิง',
                render: (r) => (
                  <Text ff="monospace" size="sm">
                    {r.ref}
                  </Text>
                ),
              },
              { accessor: 'product', title: 'สินค้า' },
              {
                accessor: 'in',
                title: 'เข้า',
                textAlign: 'right',
                render: (r) =>
                  r.in ? (
                    <Text c="green" size="sm">
                      {r.in}
                    </Text>
                  ) : (
                    ''
                  ),
              },
              {
                accessor: 'out',
                title: 'ออก',
                textAlign: 'right',
                render: (r) =>
                  r.out ? (
                    <Text c="brand" size="sm">
                      {r.out}
                    </Text>
                  ) : (
                    ''
                  ),
              },
              { accessor: 'balance', title: 'คงเหลือ', textAlign: 'right' },
              { accessor: 'by', title: 'ผู้บันทึก' },
            ]}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
