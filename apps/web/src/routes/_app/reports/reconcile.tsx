import { Paper, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReportFilters } from '@/features/reports/components/ReportFilters';
import { formatNumber } from '@/lib/format';

/** 06-05 Monthly reconciliation summary per platform (SRS 39) */
export const Route = createFileRoute('/_app/reports/reconcile')({
  component: ReconcileReportPage,
});

interface Row {
  id: string;
  platform: string;
  month: string;
  amount?: number;
  fee?: number;
  shipping?: number;
  received?: number;
  mismatched?: number;
}

const ROWS: Row[] = [
  {
    id: '1',
    platform: 'Shopee',
    month: 'พ.ย. 69',
    amount: 184200,
    fee: -11052,
    shipping: -3960,
    received: 169062,
    mismatched: 3,
  },
  {
    id: '2',
    platform: 'Lazada',
    month: 'พ.ย. 69',
    amount: 61400,
    fee: -3991,
    shipping: -1240,
    received: 56169,
    mismatched: 0,
  },
  { id: '3', platform: 'TikTok Shop', month: 'พ.ย. 69' },
  {
    id: '4',
    platform: 'Shopee',
    month: 'ต.ค. 69',
    amount: 352800,
    fee: -21168,
    shipping: -7600,
    received: 324032,
    mismatched: 0,
  },
];

const num = (n?: number) => (n === undefined ? '—' : formatNumber(n));
const diff = (r: Row) =>
  r.amount === undefined || r.received === undefined
    ? undefined
    : r.received - (r.amount + (r.fee ?? 0) + (r.shipping ?? 0));

function ReconcileReportPage() {
  return (
    <Stack>
      <PageHeader
        title="รายงานกระทบยอด"
        description="สรุปผลการกระทบยอดเงินโอนจาก Marketplace รายเดือน"
      />
      <ReportFilters />
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          records={ROWS}
          columns={[
            { accessor: 'platform', title: 'Platform' },
            { accessor: 'month', title: 'เดือน' },
            {
              accessor: 'amount',
              title: 'ยอด Order',
              textAlign: 'right',
              render: (r) => num(r.amount),
            },
            { accessor: 'fee', title: 'ค่าธรรมเนียม', textAlign: 'right', render: (r) => num(r.fee) },
            {
              accessor: 'shipping',
              title: 'ค่าส่ง',
              textAlign: 'right',
              render: (r) => num(r.shipping),
            },
            {
              accessor: 'received',
              title: 'ยอดโอน',
              textAlign: 'right',
              render: (r) => num(r.received),
            },
            {
              accessor: 'diff',
              title: 'ส่วนต่าง',
              textAlign: 'right',
              render: (r) => {
                const d = diff(r);
                return (
                  <Text size="sm" fw={d ? 700 : 400} c={d ? 'brand' : undefined}>
                    {num(d)}
                  </Text>
                );
              },
            },
            {
              accessor: 'mismatched',
              title: 'ไม่ตรง',
              textAlign: 'right',
              render: (r) =>
                r.mismatched === undefined ? <StatusBadge>ยังไม่เชื่อมต่อ</StatusBadge> : r.mismatched,
            },
          ]}
        />
      </Paper>
    </Stack>
  );
}
