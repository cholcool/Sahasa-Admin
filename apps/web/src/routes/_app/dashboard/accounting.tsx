import { SimpleGrid, Stack, Text } from '@mantine/core';
import { CHANNELS } from '@sahasa/shared';
import { createFileRoute, linkOptions } from '@tanstack/react-router';
import { AlertItem } from '@/components/ui/AlertItem';
import { BarList } from '@/components/ui/BarList';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { RoleViewSwitch } from '@/features/dashboard/components/RoleViewSwitch';
import {
  cancelledNeedingCreditNote,
  countByChannel,
  ordersAwaitingDocument,
  salesByChannel,
} from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { ordersByChannelOnDateSearch } from '@/features/orders/links';
import { todayIso } from '@/lib/dayjs';
import { formatBaht } from '@/lib/format';

/** 02-03 Dashboard: accounting view (SRS 6, pending client confirmation) */
export const Route = createFileRoute('/_app/dashboard/accounting')({
  component: AccountingDashboardPage,
});

function AccountingDashboardPage() {
  const db = useMockDb();
  const today = todayIso();
  const todayOrders = db.orders.filter((o) => o.orderDate === today);
  const sales = salesByChannel(todayOrders);
  const total = CHANNELS.reduce((s, c) => s + sales[c], 0);

  // Each bar opens the order list filtered to that channel, ordered today
  const byChannel = CHANNELS.map((c) => ({
    label: CHANNEL_LABEL_TH[c],
    value: sales[c],
    display: formatBaht(sales[c]),
    link: linkOptions({ to: '/orders', search: ordersByChannelOnDateSearch(c) }),
  })).toSorted((a, b) => b.value - a.value);

  const awaitingDoc = ordersAwaitingDocument(db);
  const issuedToday = db.documents.filter((d) => d.issuedAt.slice(0, 10) === today).length;
  const awaitingPay = db.orders.filter((o) => o.payment === 'awaiting' && o.status !== 'cancelled');
  const mismatched = db.settlements.filter((s) => {
    const expected = Math.round((s.amount + s.fee + s.shipping) * 100);
    return Math.round(s.received * 100) !== expected;
  });
  const mismatchTotal = mismatched.reduce(
    (sum, s) => sum + (s.received - (s.amount + s.fee + s.shipping)),
    0,
  );
  const needCn = cancelledNeedingCreditNote(db);
  const payCounts = countByChannel(awaitingPay);

  return (
    <Stack>
      <PageHeader title="แดชบอร์ดบัญชี" pending />
      <RoleViewSwitch value="/dashboard/accounting" />
      <StatGrid
        items={[
          {
            label: 'รอออกบิล',
            value: awaitingDoc.length,
            color: 'orange',
            to: '/accounting/documents',
          },
          { label: 'ออกบิลแล้ววันนี้', value: issuedToday, color: 'green', to: '/accounting/documents' },
          { label: 'รอยืนยันรับเงิน', value: awaitingPay.length, color: 'gold', to: '/orders' },
          {
            label: 'ยอดไม่ตรง (กระทบยอด)',
            value: mismatched.length,
            color: 'brand',
            to: '/accounting/reconcile',
          },
        ]}
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard
          title="ยอดขายวันนี้ตามช่องทาง"
          actions={<Text fw={700}>รวม {formatBaht(total)}</Text>}
        >
          {total === 0 ? (
            <Text c="dimmed">ยังไม่มียอดขายวันนี้</Text>
          ) : (
            <BarList items={byChannel} color="gold" />
          )}
        </SectionCard>
        <SectionCard title="งานที่ต้องทำ">
          <Stack gap="xs">
            {mismatched.length > 0 && (
              <AlertItem
                color="brand"
                title={`กระทบยอด Marketplace ไม่ตรง ${mismatched.length} รายการ`}
                description={`ส่วนต่างรวม ${formatBaht(mismatchTotal, { decimals: true })}`}
                to="/accounting/reconcile"
              />
            )}
            {needCn.length > 0 && (
              <AlertItem
                color="orange"
                title={`Order ยกเลิกหลังออกบิล ${needCn.length} รายการ`}
                description={`ต้องออกใบลดหนี้ อ้างอิง ${needCn.map((n) => n.doc.no).join(', ')}`}
                to="/accounting/credit-notes"
              />
            )}
            {awaitingPay.length > 0 && (
              <AlertItem
                color="gold"
                title={`Order Manual รอยืนยันรับเงิน ${awaitingPay.length} รายการ`}
                description={CHANNELS.filter((c) => payCounts[c] > 0)
                  .map((c) => `${CHANNEL_LABEL_TH[c]} ${payCounts[c]}`)
                  .join(' · ')}
                to="/orders"
              />
            )}
            {awaitingDoc.length > 0 && (
              <AlertItem
                color="orange"
                title={`รอออกเอกสาร ${awaitingDoc.length} รายการ`}
                description="Order ที่จัดส่งแล้วแต่ยังไม่มีใบกำกับ/ใบเสร็จ"
                to="/accounting/documents"
              />
            )}
          </Stack>
        </SectionCard>
      </SimpleGrid>
    </Stack>
  );
}
