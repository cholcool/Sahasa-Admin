import { Stack, Table, Text } from '@mantine/core';
import type { OrderStatus } from '@sahasa/shared';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { AnchorLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { nowThai } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import type { MockOrder } from '@/features/mock/types';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { ReportFilters, useReportFilter } from '@/features/reports/components/ReportFilters';
import { applyReportFilter } from '@/features/reports/report-filter';
import { dayjs } from '@/lib/dayjs';

/** 06-02 Pending orders by status and age (SRS 36) */
export const Route = createFileRoute('/_app/reports/pending')({
  component: PendingReportPage,
});

const PENDING: OrderStatus[] = ['pending_review', 'confirmed', 'factory_accepted', 'shipped'];

/** When the order entered its current status */
function since(o: MockOrder): string {
  if (o.status === 'shipped') return o.shippedAt ?? o.orderedAt;
  if (o.status === 'factory_accepted') return o.acceptedAt ?? o.orderedAt;
  if (o.status === 'confirmed') {
    return o.history.filter((h) => h.type === 'confirmed').at(-1)?.at ?? o.orderedAt;
  }
  return o.orderedAt;
}

function owner(o: MockOrder): string {
  if (o.status === 'pending_review')
    return o.createdBy.startsWith('ระบบ') ? 'Sales (ตรวจ Order Platform)' : o.createdBy;
  if (o.status === 'confirmed') return 'โรงงาน (รอรับ)';
  if (o.status === 'factory_accepted') return 'โรงงาน (รอส่ง)';
  return 'รอสถานะจากขนส่ง';
}

function ageText(hours: number): string {
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return d > 0 ? `${d} วัน ${h} ชม.` : `${h} ชม.`;
}

function PendingReportPage() {
  const db = useMockDb();
  const now = nowThai();
  const { filter, setFilter, options, period } = useReportFilter();
  // Orders placed in the future (mock data beyond today) are not "pending" yet
  const pending = applyReportFilter(db.orders, filter, period)
    .filter((o) => PENDING.includes(o.status) && o.orderedAt <= now)
    .map((o) => ({ order: o, hours: Math.max(0, dayjs(now).diff(dayjs(since(o)), 'hour', true)) }));

  const aging = PENDING.map((status) => {
    const list = pending.filter((p) => p.order.status === status);
    return {
      status,
      lt1: list.filter((p) => p.hours < 24).length,
      d1to2: list.filter((p) => p.hours >= 24 && p.hours <= 48).length,
      gt2: list.filter((p) => p.hours > 48).length,
    };
  });
  const oldest = [...pending].toSorted((a, b) => b.hours - a.hours).slice(0, 10);
  const count = (s: OrderStatus) => pending.filter((p) => p.order.status === s).length;

  return (
    <Stack>
      <PageHeader title="รายงาน Order ค้าง" description="Order ค้างแยกตามสถานะและอายุงาน (นับถึงตอนนี้)" />
      <ReportFilters
        value={filter}
        onChange={setFilter}
        options={options}
        exportName="pending-orders"
        exportRows={() =>
          pending.map((p) => ({
            เลขOrder: p.order.orderNumber,
            สถานะ: p.order.status,
            ค้างมาชั่วโมง: Math.round(p.hours),
            ช่องทาง: CHANNEL_LABEL_TH[p.order.channel],
            ผู้รับผิดชอบ: owner(p.order),
          }))
        }
      />
      <StatGrid
        items={[
          { label: 'รอตรวจสอบ', value: count('pending_review'), color: 'orange' },
          { label: 'ยืนยันแล้ว (รอโรงงาน)', value: count('confirmed'), color: 'blue' },
          { label: 'โรงงานรับแล้ว (รอส่ง)', value: count('factory_accepted'), color: 'gray' },
          { label: 'จัดส่งแล้ว (รอสำเร็จ)', value: count('shipped'), color: 'blue' },
        ]}
      />
      <SectionCard title="อายุงานตามสถานะ">
        <Table.ScrollContainer minWidth={480}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>สถานะ</Table.Th>
                <Table.Th ta="right">&lt; 1 วัน</Table.Th>
                <Table.Th ta="right">1–2 วัน</Table.Th>
                <Table.Th ta="right">&gt; 2 วัน</Table.Th>
                <Table.Th ta="right">รวม</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {aging.map((a) => (
                <Table.Tr key={a.status}>
                  <Table.Td>
                    <OrderStatusBadge status={a.status} />
                  </Table.Td>
                  <Table.Td ta="right">{a.lt1}</Table.Td>
                  <Table.Td ta="right">{a.d1to2}</Table.Td>
                  <Table.Td
                    ta="right"
                    fw={a.gt2 > 0 ? 700 : undefined}
                    c={a.gt2 > 0 ? 'brand' : undefined}
                  >
                    {a.gt2}
                  </Table.Td>
                  <Table.Td ta="right">{a.lt1 + a.d1to2 + a.gt2}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </SectionCard>
      <SectionCard title="ค้างนานที่สุด">
        <DataTable
          withTableBorder
          borderRadius="md"
          minHeight={160}
          idAccessor="order.orderNumber"
          records={oldest}
          noRecordsText="ไม่มี Order ค้าง"
          rowColor={(r) => (r.hours > 48 ? 'brand' : r.hours > 24 ? 'orange' : undefined)}
          columns={[
            {
              accessor: 'order.orderNumber',
              title: 'เลข Order',
              render: (r) => (
                <AnchorLink
                  to="/orders/$orderId"
                  params={{ orderId: r.order.orderNumber }}
                  fw={600}
                  size="sm"
                >
                  {r.order.orderNumber}
                </AnchorLink>
              ),
            },
            {
              accessor: 'order.status',
              title: 'สถานะ',
              render: (r) => <OrderStatusBadge status={r.order.status} />,
            },
            {
              accessor: 'hours',
              title: 'ค้างมา',
              render: (r) => (
                <Text size="sm" fw={600}>
                  {ageText(r.hours)}
                </Text>
              ),
            },
            {
              accessor: 'order.channel',
              title: 'ช่องทาง',
              render: (r) => CHANNEL_LABEL_TH[r.order.channel],
            },
            { accessor: 'owner', title: 'ผู้รับผิดชอบ', render: (r) => owner(r.order) },
          ]}
        />
      </SectionCard>
    </Stack>
  );
}
