import { SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { ColumnChart } from '@/components/ui/ColumnChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { ReportFilters } from '@/features/reports/components/ReportFilters';
import { formatBaht, formatNumber } from '@/lib/format';

/** 06-01 Sales report (SRS 35) */
export const Route = createFileRoute('/_app/reports/')({
  component: SalesReportPage,
});

// TODO: replace mock numbers with the report API
const DAILY = [42, 48, 45, 51, 39, 55, 61, 47, 50, 44, 53, 58, 30].map((v, i) => ({
  label: String(i + 1),
  value: v,
  muted: i === 12,
}));

const BY_CHANNEL = [
  { channel: 'Shopee', orders: 812, sales: 203100 },
  { channel: 'TikTok', orders: 524, sales: 130800 },
  { channel: 'Line', orders: 406, sales: 120400 },
  { channel: 'Lazada', orders: 298, sales: 69200 },
  { channel: 'Facebook', orders: 214, sales: 54600 },
  { channel: 'หน้าร้าน', orders: 98, sales: 26100 },
  { channel: 'โทร', orders: 66, sales: 19200 },
];

const BY_PRODUCT = [
  { name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', qty: '2,960 แพ็ค', sales: 548600 },
  { name: 'น้ำจิ้ม 400g', qty: '598 ขวด', sales: 74800 },
];

const totalSales = BY_CHANNEL.reduce((s, c) => s + c.sales, 0);

function SalesReportPage() {
  return (
    <Stack>
      <PageHeader title="รายงานยอดขาย" description="ยอดขายตามช่องทาง สินค้า และวัน" />
      <ReportFilters />
      <StatGrid
        items={[
          {
            label: 'ยอดขายรวม',
            value: formatBaht(totalSales),
            color: 'green',
            hint: '+8.4% จากช่วงเดียวกันเดือนก่อน',
          },
          { label: 'จำนวน Order', value: formatNumber(2418), color: 'blue' },
          { label: 'เฉลี่ยต่อ Order', value: '฿258', color: 'gray' },
          { label: 'ยกเลิก', value: '1.2%', color: 'brand', hint: '29 Order' },
        ]}
      />
      <SectionCard
        title="ยอดขายรายวัน (พันบาท)"
        actions={
          <Text size="xs" c="dimmed">
            วันที่ 13 = วันนี้ (ยังไม่ปิดวัน)
          </Text>
        }
      >
        <ColumnChart data={DAILY} />
      </SectionCard>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title="ตามช่องทาง">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ช่องทาง</Table.Th>
                <Table.Th ta="right">Order</Table.Th>
                <Table.Th ta="right">ยอดขาย</Table.Th>
                <Table.Th ta="right">สัดส่วน</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {BY_CHANNEL.map((c) => (
                <Table.Tr key={c.channel}>
                  <Table.Td>{c.channel}</Table.Td>
                  <Table.Td ta="right">{formatNumber(c.orders)}</Table.Td>
                  <Table.Td ta="right">{formatBaht(c.sales)}</Table.Td>
                  <Table.Td ta="right">
                    <Text size="xs" c="dimmed">
                      {Math.round((c.sales / totalSales) * 100)}%
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </SectionCard>
        <SectionCard title="ตามสินค้า">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>สินค้า</Table.Th>
                <Table.Th ta="right">จำนวน</Table.Th>
                <Table.Th ta="right">ยอดขาย</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {BY_PRODUCT.map((p) => (
                <Table.Tr key={p.name}>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td ta="right">{p.qty}</Table.Td>
                  <Table.Td ta="right">{formatBaht(p.sales)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr fw={700}>
                <Table.Td colSpan={2}>รวม</Table.Td>
                <Table.Td ta="right">{formatBaht(totalSales)}</Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </SectionCard>
      </SimpleGrid>
    </Stack>
  );
}
