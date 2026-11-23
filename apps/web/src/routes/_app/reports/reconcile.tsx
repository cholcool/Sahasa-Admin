import { Paper, Stack, Text } from '@mantine/core';
import type { Channel } from '@sahasa/shared';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useMockDb } from '@/features/mock/store';
import { ReportFilters, useReportFilter } from '@/features/reports/components/ReportFilters';
import { formatThaiDate } from '@/lib/dayjs';
import { formatNumber } from '@/lib/format';

/** 06-05 Monthly reconciliation summary per platform (SRS 39) */
export const Route = createFileRoute('/_app/reports/reconcile')({
  component: ReconcileReportPage,
});

interface Row {
  id: string;
  platform: string;
  period: string;
  amount: number;
  fee: number;
  shipping: number;
  received: number;
  mismatched: number;
}

const PLATFORMS: { label: string; channel: Channel }[] = [
  { label: 'Shopee', channel: 'shopee' },
  { label: 'Lazada', channel: 'lazada' },
  { label: 'TikTok Shop', channel: 'tiktok' },
];

const round2 = (n: number) => Math.round(n * 100) / 100;
const num = (n: number) => formatNumber(round2(n));

function ReconcileReportPage() {
  const db = useMockDb();
  const { filter, setFilter, options } = useReportFilter();
  const payouts = [...new Set(db.settlements.map((s) => s.paidAt))].toSorted().toReversed();

  const rows: Row[] = payouts.flatMap((paidAt) =>
    PLATFORMS.filter((p) => !filter.channel || p.channel === filter.channel).map((p) => {
      const list = db.settlements.filter((s) => s.paidAt === paidAt && s.channel === p.channel);
      const sum = (k: 'amount' | 'fee' | 'shipping' | 'received') =>
        list.reduce((s, r) => s + Math.round(r[k] * 100), 0) / 100;
      return {
        id: `${paidAt}-${p.channel}`,
        platform: p.label,
        period: `โอน ${formatThaiDate(paidAt, 'D MMM BB')}`,
        amount: sum('amount'),
        fee: sum('fee'),
        shipping: sum('shipping'),
        received: sum('received'),
        mismatched: list.filter(
          (r) => Math.round(r.received * 100) !== Math.round((r.amount + r.fee + r.shipping) * 100),
        ).length,
      };
    }),
  );
  const diff = (r: Row) => round2(r.received - (r.amount + r.fee + r.shipping));

  return (
    <Stack>
      <PageHeader
        title="รายงานกระทบยอด"
        description="สรุปผลการกระทบยอดเงินโอนจาก Marketplace ตามรอบโอน"
      />
      <ReportFilters
        value={filter}
        onChange={setFilter}
        options={options}
        showProduct={false}
        exportName="reconcile-summary"
        exportRows={() =>
          rows.map((r) => ({
            Platform: r.platform,
            รอบ: r.period,
            ยอดOrder: r.amount,
            ค่าธรรมเนียม: r.fee,
            ค่าส่ง: r.shipping,
            ยอดโอน: r.received,
            ส่วนต่าง: diff(r),
            ไม่ตรง: r.mismatched,
          }))
        }
      />
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          minHeight={160}
          records={rows}
          noRecordsText="ยังไม่มีรอบโอน"
          columns={[
            { accessor: 'platform', title: 'Platform' },
            { accessor: 'period', title: 'รอบ' },
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
              render: (r) => (r.amount === 0 ? <StatusBadge>ไม่มีรายการ</StatusBadge> : r.mismatched),
            },
          ]}
        />
      </Paper>
    </Stack>
  );
}
