import { Alert, SimpleGrid, Stack, Text } from '@mantine/core';
import { CHANNELS, type OrderStatus } from '@sahasa/shared';
import { createFileRoute, linkOptions } from '@tanstack/react-router';
import { AlertItem } from '@/components/ui/AlertItem';
import { BarList } from '@/components/ui/BarList';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { RoleViewSwitch } from '@/features/dashboard/components/RoleViewSwitch';
import { countByChannel, nextCutoff, roundOrders, statusCounts } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { ordersByChannelOnDateSearch } from '@/features/orders/links';
import { formatThaiDate, todayIso } from '@/lib/dayjs';

/** 02-01 Dashboard: Sales/Admin view (SRS 3, 4, 5) */
export const Route = createFileRoute('/_app/')({
  component: AdminDashboardPage,
});

const STATUS_STATS: { status: OrderStatus; color: string }[] = [
  { status: 'pending_review', color: 'orange' },
  { status: 'confirmed', color: 'blue' },
  { status: 'factory_accepted', color: 'gray' },
  { status: 'shipped', color: 'blue' },
  { status: 'delivered', color: 'green' },
  { status: 'cancelled', color: 'brand' },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_review: 'รอตรวจสอบ',
  confirmed: 'ยืนยันแล้ว',
  factory_accepted: 'โรงงานรับแล้ว',
  partially_shipped: 'ส่งไม่ครบ',
  shipped: 'จัดส่งแล้ว',
  delivered: 'จัดส่งสำเร็จ',
  cancelled: 'ยกเลิก',
};

function AdminDashboardPage() {
  const db = useMockDb();
  const today = todayIso();
  const cutoff = nextCutoff();
  const counts = statusCounts(db.orders);
  const todayOrders = db.orders.filter((o) => o.orderDate === today);
  const perChannel = countByChannel(todayOrders);

  // Each bar opens the order list filtered to that channel, ordered today
  const byChannel = CHANNELS.map((c) => ({
    label: CHANNEL_LABEL_TH[c],
    value: perChannel[c],
    link: linkOptions({ to: '/orders', search: ordersByChannelOnDateSearch(c) }),
  })).toSorted((a, b) => b.value - a.value);

  const awaiting = db.orders.filter((o) => o.payment === 'awaiting' && o.status !== 'cancelled');
  const awaitingCounts = countByChannel(awaiting);
  const awaitingByChannel = CHANNELS.filter((c) => awaitingCounts[c] > 0)
    .map((c) => `${CHANNEL_LABEL_TH[c]} ${awaitingCounts[c]}`)
    .join(' · ');
  const lastError = db.platformLogs.find((l) => !l.ok);
  const cancelledAfterAccept = db.orders
    .filter((o) => o.status === 'cancelled' && o.acceptedAt)
    .toSorted((a, b) => (b.cancelledAt ?? '').localeCompare(a.cancelledAt ?? ''))[0];

  return (
    <Stack>
      <RoleViewSwitch value="/" />
      <Alert color="gold" variant="light">
        รอบตัดถัดไป: {cutoff.isToday ? 'วันนี้' : formatThaiDate(cutoff.roundDate, 'D MMM')} 12:00 น. ·
        Order ในรอบนี้ {roundOrders(db, cutoff.roundDate).length} รายการ · เหลือเวลา {cutoff.left}
      </Alert>
      <StatGrid
        items={STATUS_STATS.map((s) => ({
          label: STATUS_LABEL[s.status],
          value: counts[s.status],
          color: s.color,
          link: linkOptions({ to: '/orders', search: { status: s.status } }),
        }))}
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard
          title="Order ตามช่องทางการขาย (วันนี้)"
          actions={<Text fw={700}>รวม {todayOrders.length}</Text>}
        >
          {todayOrders.length === 0 ? (
            <Text c="dimmed">ยังไม่มี Order วันนี้</Text>
          ) : (
            <BarList items={byChannel} />
          )}
        </SectionCard>
        <SectionCard title="แจ้งเตือน">
          <Stack gap="xs">
            {db.unmappedSkus.length > 0 && (
              <AlertItem
                color="orange"
                title={`SKU จับคู่ไม่ได้ ${db.unmappedSkus.length} รายการ`}
                description={`${[...new Set(db.unmappedSkus.map((u) => u.platform))].join(', ')} · รอ Admin จับคู่รหัสสินค้า`}
                to="/platforms/unmapped-sku"
              />
            )}
            {lastError && (
              <AlertItem
                color="brand"
                title={`API error: ${lastError.platform}`}
                description={`${lastError.message} · ${formatThaiDate(lastError.at, 'D MMM HH:mm')} น.`}
                to="/platforms/logs"
              />
            )}
            {cancelledAfterAccept && (
              <AlertItem
                color="brand"
                title="Order ถูกยกเลิกหลังโรงงานรับ"
                description={`${cancelledAfterAccept.orderNumber} · ${cancelledAfterAccept.cancelReason ?? ''}`}
                to={`/orders/${cancelledAfterAccept.orderNumber}`}
              />
            )}
            {awaiting.length > 0 && (
              <AlertItem
                color="orange"
                title={`Order Manual รอยืนยันรับเงิน ${awaiting.length} รายการ`}
                description={awaitingByChannel}
                to="/orders"
              />
            )}
            {!db.unmappedSkus.length && !lastError && !cancelledAfterAccept && !awaiting.length && (
              <Text c="dimmed">ไม่มีแจ้งเตือน</Text>
            )}
          </Stack>
        </SectionCard>
      </SimpleGrid>
    </Stack>
  );
}
