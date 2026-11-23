import { SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { CHANNELS } from '@sahasa/shared';
import { createFileRoute } from '@tanstack/react-router';
import { BarList } from '@/components/ui/BarList';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { useMockDb } from '@/features/mock/store';
import type { MockOrder } from '@/features/mock/types';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { ReportFilters, useReportFilter } from '@/features/reports/components/ReportFilters';
import { applyReportFilter } from '@/features/reports/report-filter';

/** 06-03 Edit / cancel statistics (SRS 37) */
export const Route = createFileRoute('/_app/reports/edits')({
  component: EditsReportPage,
});

const edits = (o: MockOrder) => o.history.filter((h) => h.type === 'edited').length;
const pct = (n: number, of: number) => `${of ? ((n / of) * 100).toFixed(1) : '0.0'}%`;

function EditsReportPage() {
  const db = useMockDb();
  const { filter, setFilter, options, period } = useReportFilter();
  const orders = applyReportFilter(db.orders, filter, period);
  const cancelled = orders.filter((o) => o.status === 'cancelled');
  const editCount = orders.reduce((s, o) => s + edits(o), 0);

  const reasonCounts = new Map<string, number>();
  for (const o of cancelled) {
    const r = o.cancelReason ?? 'อื่นๆ';
    reasonCounts.set(r, (reasonCounts.get(r) ?? 0) + 1);
  }
  const reasons = [...reasonCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .toSorted((a, b) => b.value - a.value);

  const byChannel = CHANNELS.map((c) => {
    const list = orders.filter((o) => o.channel === c);
    const e = list.reduce((s, o) => s + edits(o), 0);
    const x = list.filter((o) => o.status === 'cancelled').length;
    return { channel: CHANNEL_LABEL_TH[c], edits: e, cancels: x, pct: pct(e + x, list.length) };
  });

  return (
    <Stack>
      <PageHeader
        title="สถิติการแก้ไข/ยกเลิก"
        description="จำนวนการแก้ไขและยกเลิก แยกตามเหตุผลและช่องทาง"
      />
      <ReportFilters
        value={filter}
        onChange={setFilter}
        options={options}
        exportName="edits-cancels"
        exportRows={() =>
          orders
            .filter((o) => o.status === 'cancelled' || edits(o) > 0)
            .map((o) => ({
              เลขOrder: o.orderNumber,
              ช่องทาง: CHANNEL_LABEL_TH[o.channel],
              แก้ไขครั้ง: edits(o),
              ยกเลิก: o.status === 'cancelled' ? 'ใช่' : '',
              เหตุผล: o.cancelReason ?? '',
            }))
        }
      />
      <StatGrid
        items={[
          {
            label: 'แก้ไข',
            value: editCount,
            color: 'orange',
            hint: `${pct(editCount, orders.length)} ของ Order`,
          },
          {
            label: 'ยกเลิก',
            value: cancelled.length,
            color: 'brand',
            hint: `${pct(cancelled.length, orders.length)} ของ Order`,
          },
          {
            label: 'แก้ไขหลังโรงงานรับ',
            value: orders.filter((o) => o.editedAfterAccept).length,
            color: 'orange',
          },
          {
            label: 'ยกเลิกหลังโรงงานรับ',
            value: cancelled.filter((o) => o.acceptedAt).length,
            color: 'brand',
          },
        ]}
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title="เหตุผลการยกเลิก">
          {reasons.length === 0 ? <Text c="dimmed">ไม่มีการยกเลิก</Text> : <BarList items={reasons} />}
        </SectionCard>
        <SectionCard title="ตามช่องทาง">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ช่องทาง</Table.Th>
                <Table.Th ta="right">แก้ไข</Table.Th>
                <Table.Th ta="right">ยกเลิก</Table.Th>
                <Table.Th ta="right">% ของ Order</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {byChannel.map((c) => (
                <Table.Tr key={c.channel}>
                  <Table.Td>{c.channel}</Table.Td>
                  <Table.Td ta="right">{c.edits}</Table.Td>
                  <Table.Td ta="right">{c.cancels}</Table.Td>
                  <Table.Td ta="right">{c.pct}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </SectionCard>
      </SimpleGrid>
    </Stack>
  );
}
