import {
  Alert,
  Button,
  Group,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPrinter } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrintPreviewModal } from '@/features/factory/components/FactoryModals';
import { isMarketplace } from '@/features/mock/catalog';
import { productQty, roundLabel, roundOrders } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';

/** 04-02 Production summary per round (SRS 22, 14) */
export const Route = createFileRoute('/_app/factory/production')({
  component: ProductionSummaryPage,
});

function ProductionSummaryPage() {
  const db = useMockDb();
  const today = todayIso();
  const rounds = [-1, 0, 1, 2].map((i) => dayjs(today).add(i, 'day').format('YYYY-MM-DD'));
  const [round, setRound] = useState(today);
  const [printOpened, print] = useDisclosure(false);

  const orders = roundOrders(db, round);
  const total = productQty(orders);
  // "Picked" = orders the factory has packed (accepted with a printed pick list, or already shipped)
  const picked = productQty(
    orders.filter((o) => o.status !== 'confirmed' && (o.printed.pickList > 0 || o.shippedAt)),
  );
  const inserted = orders.filter((o) => o.insertedAfterCutoff);
  const [tofu, sauce] = db.products;

  const byCarrier = db.carriers
    .map((c) => {
      const list = orders.filter((o) => o.carrierId === c.id);
      const qty = productQty(list);
      const platform = list.filter((o) => isMarketplace(o.channel)).length;
      const system = list.length - platform;
      const label =
        c.id === 'store'
          ? 'ไม่ต้องใช้'
          : [platform && `Platform label ${platform}`, system && `ระบบ ${system}`]
              .filter(Boolean)
              .join(' · ') || '—';
      return {
        carrier: c.fullName,
        orders: list.length,
        tofu: tofu ? (qty[tofu.id] ?? 0) : 0,
        sauce: sauce ? (qty[sauce.id] ?? 0) : 0,
        label,
        labelColor: c.hasApi ? 'blue' : 'gray',
      };
    })
    .filter((r) => r.orders > 0);
  const sum = (key: 'orders' | 'tofu' | 'sauce') => byCarrier.reduce((s, r) => s + r[key], 0);

  return (
    <Stack>
      <PageHeader
        title="สรุปยอดผลิต"
        description="ยอดสินค้ารวมต่อรอบ ใช้วางแผนผลิตและจัดสินค้า"
        actions={
          <>
            <SegmentedControl
              size="xs"
              radius="xl"
              value={round}
              onChange={setRound}
              data={rounds.map((d) => ({ value: d, label: roundLabel(d, today) }))}
            />
            <Button variant="default" leftSection={<IconPrinter size={16} />} onClick={print.open}>
              พิมพ์ใบสรุป
            </Button>
          </>
        }
      />
      {inserted.length > 0 && (
        <Alert color="orange" variant="light">
          ยอดอัปเดตอัตโนมัติจาก Order แทรกหลังตัดรอบ: {inserted.map((o) => o.orderNumber).join(', ')}
        </Alert>
      )}
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {db.products.map((p) => {
          const t = total[p.id] ?? 0;
          const done = picked[p.id] ?? 0;
          return (
            <SectionCard key={p.id}>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4}>{p.name}</Title>
                  <Text size="xs" c="dimmed">
                    รวมทุกขนส่ง · รอบ {formatThaiDate(round, 'D MMM')} 12:00
                  </Text>
                </div>
                <Group gap={6} align="baseline">
                  <Text fz={28} fw={600}>
                    {t}
                  </Text>
                  <Text c="dimmed">{p.unit}</Text>
                </Group>
              </Group>
              <Progress value={t ? (done / t) * 100 : 0} color="green" mt="sm" />
              <Text size="xs" c="dimmed" mt={4}>
                จัดแล้ว {done} / {t}
              </Text>
            </SectionCard>
          );
        })}
      </SimpleGrid>
      <SectionCard title="แยกตามขนส่ง">
        <Table.ScrollContainer minWidth={560}>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ขนส่ง</Table.Th>
                <Table.Th ta="right">จำนวน Order</Table.Th>
                <Table.Th ta="right">เต้าหู้ (แพ็ค)</Table.Th>
                <Table.Th ta="right">น้ำจิ้ม (ขวด)</Table.Th>
                <Table.Th>ใบปะหน้า</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {byCarrier.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" ta="center">
                      ไม่มี Order ในรอบนี้
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {byCarrier.map((r) => (
                <Table.Tr key={r.carrier}>
                  <Table.Td>{r.carrier}</Table.Td>
                  <Table.Td ta="right">{r.orders}</Table.Td>
                  <Table.Td ta="right">{r.tofu}</Table.Td>
                  <Table.Td ta="right">{r.sauce}</Table.Td>
                  <Table.Td>
                    <StatusBadge color={r.labelColor}>{r.label}</StatusBadge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr fw={700}>
                <Table.Td>รวม</Table.Td>
                <Table.Td ta="right">{sum('orders')}</Table.Td>
                <Table.Td ta="right">{sum('tofu')}</Table.Td>
                <Table.Td ta="right">{sum('sauce')}</Table.Td>
                <Table.Td />
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      </SectionCard>
      <PrintPreviewModal
        opened={printOpened}
        onClose={print.close}
        orders={orders}
        defaultDoc="ใบสรุปยอดผลิต"
      />
    </Stack>
  );
}
