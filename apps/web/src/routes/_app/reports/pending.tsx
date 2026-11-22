import { Stack, Table, Text } from '@mantine/core';
import type { OrderStatus } from '@sahasa/shared';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { AnchorLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { ReportFilters } from '@/features/reports/components/ReportFilters';

/** 06-02 Pending orders by status and age (SRS 36) */
export const Route = createFileRoute('/_app/reports/pending')({
  component: PendingReportPage,
});

const AGING: { status: OrderStatus; lt1: number; d1to2: number; gt2: number }[] = [
  { status: 'pending_review', lt1: 9, d1to2: 2, gt2: 1 },
  { status: 'confirmed', lt1: 25, d1to2: 3, gt2: 0 },
  { status: 'factory_accepted', lt1: 15, d1to2: 0, gt2: 0 },
  { status: 'shipped', lt1: 22, d1to2: 14, gt2: 4 },
];

const OLDEST = [
  {
    order: 'ORD-000088',
    status: 'shipped' as OrderStatus,
    age: '4 วัน 2 ชม.',
    channel: 'Lazada',
    owner: 'รอสถานะจากขนส่ง',
    severe: true,
  },
  {
    order: 'ORD-000112',
    status: 'pending_review' as OrderStatus,
    age: '2 วัน 5 ชม.',
    channel: 'Line',
    owner: 'Sales01',
    severe: false,
  },
];

function PendingReportPage() {
  return (
    <Stack>
      <PageHeader title="รายงาน Order ค้าง" description="Order ค้างแยกตามสถานะและอายุงาน" />
      <ReportFilters />
      <StatGrid
        items={[
          { label: 'รอตรวจสอบ', value: 12, color: 'orange' },
          { label: 'ยืนยันแล้ว (รอโรงงาน)', value: 28, color: 'blue' },
          { label: 'โรงงานรับแล้ว (รอส่ง)', value: 15, color: 'gray' },
          { label: 'จัดส่งแล้ว (รอสำเร็จ)', value: 40, color: 'blue' },
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
              {AGING.map((a) => (
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
          idAccessor="order"
          records={OLDEST}
          rowColor={(r) => (r.severe ? 'brand' : 'orange')}
          columns={[
            {
              accessor: 'order',
              title: 'เลข Order',
              render: (r) => (
                <AnchorLink to="/orders/$orderId" params={{ orderId: r.order }} fw={600} size="sm">
                  {r.order}
                </AnchorLink>
              ),
            },
            {
              accessor: 'status',
              title: 'สถานะ',
              render: (r) => <OrderStatusBadge status={r.status} />,
            },
            {
              accessor: 'age',
              title: 'ค้างมา',
              render: (r) => (
                <Text size="sm" fw={600}>
                  {r.age}
                </Text>
              ),
            },
            { accessor: 'channel', title: 'ช่องทาง' },
            { accessor: 'owner', title: 'ผู้รับผิดชอบ' },
          ]}
        />
      </SectionCard>
    </Stack>
  );
}
