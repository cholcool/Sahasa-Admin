import { SimpleGrid, Stack, Table } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { BarList } from '@/components/ui/BarList';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { ReportFilters } from '@/features/reports/components/ReportFilters';

/** 06-03 Edit / cancel statistics (SRS 37) */
export const Route = createFileRoute('/_app/reports/edits')({
  component: EditsReportPage,
});

const REASONS = [
  { label: 'ลูกค้าขอยกเลิก', value: 12 },
  { label: 'ชำระเงินไม่สำเร็จ', value: 7 },
  { label: 'ที่อยู่ไม่ถูกต้อง / ติดต่อไม่ได้', value: 4 },
  { label: 'สินค้าหมด / ผลิตไม่ทัน', value: 3 },
  { label: 'Order ซ้ำ', value: 2 },
  { label: 'อื่นๆ', value: 1 },
];

const BY_CHANNEL = [
  { channel: 'Shopee', edits: 18, cancels: 9, pct: '3.3%' },
  { channel: 'TikTok', edits: 12, cancels: 7, pct: '3.6%' },
  { channel: 'Line', edits: 31, cancels: 6, pct: '9.1%' },
  { channel: 'Lazada', edits: 8, cancels: 4, pct: '4.0%' },
  { channel: 'Facebook', edits: 11, cancels: 2, pct: '6.1%' },
  { channel: 'หน้าร้าน', edits: 2, cancels: 0, pct: '2.0%' },
  { channel: 'โทร', edits: 4, cancels: 1, pct: '7.6%' },
];

function EditsReportPage() {
  return (
    <Stack>
      <PageHeader
        title="สถิติการแก้ไข/ยกเลิก"
        description="จำนวนการแก้ไขและยกเลิก แยกตามเหตุผลและช่องทาง"
      />
      <ReportFilters />
      <StatGrid
        items={[
          { label: 'แก้ไข', value: 86, color: 'orange', hint: '3.6% ของ Order' },
          { label: 'ยกเลิก', value: 29, color: 'brand', hint: '1.2% ของ Order' },
          { label: 'แก้ไขหลังโรงงานรับ', value: 11, color: 'orange' },
          { label: 'ยกเลิกหลังโรงงานรับ', value: 4, color: 'brand' },
        ]}
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title="เหตุผลการยกเลิก">
          <BarList items={REASONS} />
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
              {BY_CHANNEL.map((c) => (
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
