import { Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExportExcelButton } from '@/features/reports/components/ReportFilters';
import { StockDraftBanner } from '@/features/stock/components/StockDraftBanner';
import { nowThai } from '@/features/mock/actions';
import { stockMovements, type StockMove } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { formatThaiDate } from '@/lib/dayjs';

/** 09-03 Stock movement ledger (SRS 59, draft) */
export const Route = createFileRoute('/_app/stock/ledger')({
  component: StockLedgerPage,
});

type MoveType = StockMove['type'];

const TYPE: Record<MoveType, { label: string; color: string }> = {
  order: { label: 'ตัดจาก Order', color: 'blue' },
  receive: { label: 'รับเข้า', color: 'green' },
  adjust: { label: 'ปรับยอด', color: 'orange' },
};

const PAGE_SIZE = 30;

function StockLedgerPage() {
  const [type, setType] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const db = useMockDb();
  const nameOf = (id: string) => db.products.find((p) => p.id === id)?.name ?? id;
  const query = q.trim().toLowerCase();
  const rows = stockMovements(db, nowThai())
    .filter(
      (m) =>
        (!type || m.type === type) &&
        (!product || m.productId === product) &&
        (!query || m.ref.toLowerCase().includes(query)),
    )
    .map((m) => ({
      ...m,
      product: nameOf(m.productId),
      atText: formatThaiDate(m.at, 'D MMM HH:mm'),
    }));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Stack>
      <StockDraftBanner />
      <PageHeader
        title="ประวัติการเคลื่อนไหว"
        description="รายการเข้า-ออกของสินค้า"
        actions={
          <ExportExcelButton
            filename="stock-ledger"
            rows={() =>
              rows.map((r) => ({
                วันเวลา: r.atText,
                ประเภท: TYPE[r.type].label,
                อ้างอิง: r.ref,
                สินค้า: r.product,
                เข้า: r.in,
                ออก: r.out,
                คงเหลือ: r.balance,
                ผู้บันทึก: r.by,
              }))
            }
          />
        }
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={220}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเอกสารอ้างอิง"
              value={q}
              onChange={(e) => {
                setQ(e.currentTarget.value);
                setPage(1);
              }}
            />
            <Select
              placeholder="ทุกสินค้า"
              clearable
              data={db.products.map((p) => ({ value: p.id, label: p.name }))}
              value={product}
              onChange={(v) => {
                setProduct(v);
                setPage(1);
              }}
            />
            <Select
              placeholder="ทุกประเภท"
              clearable
              data={Object.entries(TYPE).map(([value, t]) => ({ value, label: t.label }))}
              value={type}
              onChange={(v) => {
                setType(v);
                setPage(1);
              }}
            />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            idAccessor="id"
            minHeight={200}
            records={pageRows}
            totalRecords={rows.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
            noRecordsText="ไม่มีรายการ"
            columns={[
              { accessor: 'atText', title: 'วันเวลา' },
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
