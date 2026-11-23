import { Alert, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { AlertItem } from '@/components/ui/AlertItem';
import { BarList } from '@/components/ui/BarList';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { RoleViewSwitch } from '@/features/dashboard/components/RoleViewSwitch';
import { EditedAfterAcceptModal } from '@/features/factory/components/FactoryModals';
import { countByCarrier, nextCutoff, productQty, roundOrders } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import type { MockOrder } from '@/features/mock/types';
import { formatThaiDate, todayIso } from '@/lib/dayjs';

/** 02-02 Dashboard: factory view (SRS 6, pending client confirmation) */
export const Route = createFileRoute('/_app/dashboard/factory')({
  component: FactoryDashboardPage,
});

function FactoryDashboardPage() {
  const db = useMockDb();
  const today = todayIso();
  const cutoff = nextCutoff();
  const [flagged, setFlagged] = useState<MockOrder | null>(null);

  const round = roundOrders(db, today);
  const perCarrier = countByCarrier(round);
  const qty = productQty(round);
  const shippedToday = db.orders.filter((o) => o.shippedAt?.slice(0, 10) === today).length;

  const edited = round.filter((o) => o.editedAfterAccept);
  const inserted = round.filter((o) => o.insertedAfterCutoff);
  const cancelledAfter = db.orders
    .filter((o) => o.status === 'cancelled' && o.acceptedAt && o.roundDate >= today)
    .slice(-3);

  return (
    <Stack>
      <PageHeader title="แดชบอร์ดโรงงาน" pending />
      <RoleViewSwitch value="/dashboard/factory" />
      <Alert color="gold" variant="light">
        <Group justify="space-between">
          <Text size="sm">
            รอบตัดถัดไป: {cutoff.isToday ? 'วันนี้' : formatThaiDate(cutoff.roundDate, 'D MMM')} 12:00 น.
            · Order ในรอบนี้ {roundOrders(db, cutoff.roundDate).length} รายการ
          </Text>
          <Button size="xs" variant="default" component={Link} to="/factory">
            ไปที่คิว Order
          </Button>
        </Group>
      </Alert>
      <StatGrid
        items={[
          {
            label: 'รอโรงงานรับ',
            value: db.orders.filter((o) => o.status === 'confirmed' && o.roundDate <= today).length,
            color: 'blue',
            to: '/factory',
          },
          {
            label: 'โรงงานรับแล้ว',
            value: db.orders.filter((o) => o.status === 'factory_accepted').length,
            color: 'gray',
            to: '/factory',
          },
          {
            label: 'รอจัดส่ง',
            value: db.orders.filter((o) => o.status === 'factory_accepted' && !o.tracking).length,
            color: 'orange',
            to: '/factory/shipping',
          },
          { label: 'จัดส่งแล้ววันนี้', value: shippedToday, color: 'green', to: '/factory/shipping' },
        ]}
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title={`คิวรอบ ${formatThaiDate(today, 'D MMM')} 12:00 แยกตามขนส่ง`}>
          {round.length === 0 ? (
            <Text c="dimmed">ไม่มี Order ในรอบนี้</Text>
          ) : (
            <BarList
              items={db.carriers.map((c) => ({
                label: c.name,
                value: perCarrier[c.id],
                display: `${perCarrier[c.id]} Order`,
              }))}
            />
          )}
        </SectionCard>
        <SectionCard
          title="สรุปยอดผลิตรอบนี้"
          actions={
            <Button size="xs" variant="subtle" component={Link} to="/factory/production">
              ดูทั้งหมด
            </Button>
          }
        >
          <Stack gap="xs">
            {db.products.map((p) => (
              <Paper key={p.id} withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <Text>{p.name}</Text>
                  <Group gap={6}>
                    <Text fz={22} fw={600}>
                      {qty[p.id] ?? 0}
                    </Text>
                    <Text c="dimmed">{p.unit}</Text>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </SimpleGrid>
      <SectionCard title="แจ้งเตือนโรงงาน">
        <Stack gap="xs">
          {edited.map((o) => (
            <AlertItem
              key={o.orderNumber}
              color="orange"
              title="Order ถูกแก้ไขหลังโรงงานรับ"
              description={`${o.orderNumber} · ${o.history.filter((h) => h.type === 'edited').at(-1)?.text ?? ''}`}
              onClick={() => setFlagged(o)}
            />
          ))}
          {inserted.map((o) => (
            <AlertItem
              key={o.orderNumber}
              color="blue"
              title="Order แทรกหลังตัดรอบ"
              description={`${o.orderNumber} · เพิ่มเข้ารอบ ${formatThaiDate(o.roundDate, 'D MMM')} 12:00`}
              to="/factory"
            />
          ))}
          {cancelledAfter.map((o) => (
            <AlertItem
              key={o.orderNumber}
              color="brand"
              title="Order ถูกยกเลิกหลังโรงงานรับ"
              description={`${o.orderNumber} · ${o.cancelReason ?? ''}`}
              to={`/orders/${o.orderNumber}`}
            />
          ))}
          {edited.length + inserted.length + cancelledAfter.length === 0 && (
            <Text c="dimmed">ไม่มีแจ้งเตือน</Text>
          )}
        </Stack>
      </SectionCard>

      <EditedAfterAcceptModal
        opened={flagged !== null}
        onClose={() => setFlagged(null)}
        order={flagged}
      />
    </Stack>
  );
}
