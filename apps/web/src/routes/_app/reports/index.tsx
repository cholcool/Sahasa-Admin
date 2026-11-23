import { SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { CHANNELS } from '@sahasa/shared';
import { createFileRoute } from '@tanstack/react-router';
import { ColumnChart } from '@/components/ui/ColumnChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { useMockDb } from '@/features/mock/store';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { ReportFilters, useReportFilter } from '@/features/reports/components/ReportFilters';
import { applyReportFilter } from '@/features/reports/report-filter';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';
import { formatBaht, formatNumber } from '@/lib/format';

/** 06-01 Sales report (SRS 35) */
export const Route = createFileRoute('/_app/reports/')({
  component: SalesReportPage,
});

function SalesReportPage() {
  const db = useMockDb();
  const today = todayIso();
  const { filter, setFilter, options, period } = useReportFilter();
  const orders = applyReportFilter(db.orders, filter, period);
  const sold = orders.filter((o) => o.status !== 'cancelled');
  const cancelled = orders.length - sold.length;
  // With a product filter, sales count only that product's lines
  const amount = (o: (typeof sold)[number]) =>
    filter.productId
      ? o.lines
          .filter((l) => l.productId === filter.productId)
          .reduce((s, l) => s + l.qty * l.price, 0)
      : o.total;
  const totalSales = sold.reduce((s, o) => s + amount(o), 0);

  const days: string[] = [];
  if (period) {
    for (let d = period.from; d <= period.to; d = dayjs(d).add(1, 'day').format('YYYY-MM-DD'))
      days.push(d);
  }
  const daily = days.map((d) => ({
    label: String(dayjs(d).date()),
    value:
      Math.round(sold.filter((o) => o.orderDate === d).reduce((s, o) => s + amount(o), 0) / 100) /
      10,
    muted: d >= today,
  }));

  const byChannel = CHANNELS.map((c) => {
    const list = sold.filter((o) => o.channel === c);
    return {
      channel: CHANNEL_LABEL_TH[c],
      orders: list.length,
      sales: list.reduce((s, o) => s + amount(o), 0),
    };
  })
    .filter((c) => c.orders > 0)
    .toSorted((a, b) => b.sales - a.sales);

  const byProduct = db.products
    .filter((p) => !filter.productId || p.id === filter.productId)
    .map((p) => {
      const lines = sold.flatMap((o) => o.lines.filter((l) => l.productId === p.id));
      return {
        name: p.name,
        qty: `${formatNumber(lines.reduce((s, l) => s + l.qty, 0))} ${p.unit}`,
        sales: lines.reduce((s, l) => s + l.qty * l.price, 0),
      };
    });
  const shipping = filter.productId ? 0 : sold.reduce((s, o) => s + o.shippingFee, 0);

  return (
    <Stack>
      <PageHeader title="รายงานยอดขาย" description="ยอดขายตามช่องทาง สินค้า และวัน (ตามวันที่สั่ง)" />
      <ReportFilters
        value={filter}
        onChange={setFilter}
        options={options}
        exportName="sales-report"
        exportRows={() =>
          sold.map((o) => ({
            เลขOrder: o.orderNumber,
            วันที่สั่ง: o.orderDate,
            ช่องทาง: CHANNEL_LABEL_TH[o.channel],
            ลูกค้า: o.customerName,
            สินค้า: o.lines.map((l) => `${l.name} x${l.qty}`).join(' / '),
            ค่าส่ง: o.shippingFee,
            ยอดรวม: o.total,
            สถานะ: o.status,
          }))
        }
      />
      <StatGrid
        items={[
          {
            label: 'ยอดขายรวม',
            value: formatBaht(totalSales),
            color: 'green',
            hint: period?.label,
          },
          { label: 'จำนวน Order', value: formatNumber(sold.length), color: 'blue' },
          {
            label: 'เฉลี่ยต่อ Order',
            value: formatBaht(sold.length ? Math.round(totalSales / sold.length) : 0),
            color: 'gray',
          },
          {
            label: 'ยกเลิก',
            value: `${orders.length ? ((cancelled / orders.length) * 100).toFixed(1) : '0.0'}%`,
            color: 'brand',
            hint: `${cancelled} Order`,
          },
        ]}
      />
      <SectionCard
        title="ยอดขายรายวัน (พันบาท)"
        actions={
          <Text size="xs" c="dimmed">
            สีอ่อน = วันนี้ ({formatThaiDate(today, 'D MMM')}) ยังไม่ปิดวัน หรือวันในอนาคต
          </Text>
        }
      >
        <ColumnChart data={daily} />
      </SectionCard>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title="ตามช่องทาง">
          <Table.ScrollContainer minWidth={360}>
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
                {byChannel.map((c) => (
                  <Table.Tr key={c.channel}>
                    <Table.Td>{c.channel}</Table.Td>
                    <Table.Td ta="right">{formatNumber(c.orders)}</Table.Td>
                    <Table.Td ta="right">{formatBaht(c.sales)}</Table.Td>
                    <Table.Td ta="right">
                      <Text size="xs" c="dimmed">
                        {totalSales ? Math.round((c.sales / totalSales) * 100) : 0}%
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
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
              {byProduct.map((p) => (
                <Table.Tr key={p.name}>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td ta="right">{p.qty}</Table.Td>
                  <Table.Td ta="right">{formatBaht(p.sales)}</Table.Td>
                </Table.Tr>
              ))}
              {shipping > 0 && (
                <Table.Tr>
                  <Table.Td>ค่าส่ง</Table.Td>
                  <Table.Td />
                  <Table.Td ta="right">{formatBaht(shipping)}</Table.Td>
                </Table.Tr>
              )}
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
