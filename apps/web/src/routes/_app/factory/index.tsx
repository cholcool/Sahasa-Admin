import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AnchorLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditedAfterAcceptModal } from '@/features/factory/components/FactoryModals';
import { acceptOrders } from '@/features/mock/actions';
import { carrierName, itemsText, nextCutoff, roundLabel } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import type { MockOrder } from '@/features/mock/types';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';

/** 04-01 Factory order queue (SRS 20, 21, 28) */
export const Route = createFileRoute('/_app/factory/')({
  component: FactoryQueuePage,
});

const selectable = (r: MockOrder) => r.status === 'confirmed';

function FactoryQueuePage() {
  const db = useMockDb();
  const today = todayIso();
  const cutoff = nextCutoff();
  const rounds = [0, 1, 2].map((i) => dayjs(today).add(i, 'day').format('YYYY-MM-DD'));
  const [round, setRound] = useState(today);
  const [tab, setTab] = useState<string | null>('all');
  const [selected, setSelected] = useState<MockOrder[]>([]);
  const [toAccept, setToAccept] = useState<MockOrder[]>([]);
  const [flagged, setFlagged] = useState<MockOrder | null>(null);

  // Queue = confirmed orders of the round plus those the factory already accepted
  const inRound = db.orders
    .filter(
      (o) =>
        o.roundDate === round &&
        (['confirmed', 'factory_accepted'].includes(o.status) ||
          (o.status === 'cancelled' && o.acceptedAt)),
    )
    .toSorted((a, b) => a.orderedAt.localeCompare(b.orderedAt));
  const rows = inRound.filter((r) => tab === 'all' || r.carrierId === tab);
  const futureCount = (d: string) =>
    db.orders.filter((o) => o.roundDate === d && o.status === 'confirmed').length;

  return (
    <Stack>
      <PageHeader
        title="คิว Order"
        description="Order ที่ยืนยันแล้ว แยกตามรอบตัดและขนส่ง"
        actions={
          <>
            <Button
              variant="default"
              leftSection={<IconPrinter size={16} />}
              component={Link}
              to="/factory/print"
            >
              พิมพ์ใบจัดสินค้า
            </Button>
            <Button disabled={selected.length === 0} onClick={() => setToAccept(selected)}>
              รับ Order ที่เลือก
            </Button>
          </>
        }
      />
      <Alert color="gold" variant="light">
        <Group justify="space-between">
          <Text size="sm">
            รอบ {formatThaiDate(round)} · ตัดรอบ 12:00 น.
            {round === cutoff.roundDate && ` · เหลือเวลา ${cutoff.left}`}
          </Text>
          <SegmentedControl
            size="xs"
            radius="xl"
            value={round}
            onChange={(v) => {
              setRound(v);
              setSelected([]);
            }}
            data={rounds.map((d, i) => ({
              value: d,
              label: i === 0 ? roundLabel(d, today) : `${roundLabel(d, today)} · ${futureCount(d)}`,
            }))}
          />
        </Group>
      </Alert>
      <StatGrid
        items={[
          {
            label: 'รอโรงงานรับ',
            value: inRound.filter((o) => o.status === 'confirmed').length,
            color: 'blue',
          },
          {
            label: 'โรงงานรับแล้ว',
            value: inRound.filter((o) => o.status === 'factory_accepted').length,
            color: 'gray',
          },
          {
            label: 'แทรกหลังตัดรอบ',
            value: inRound.filter((o) => o.insertedAfterCutoff).length,
            color: 'orange',
          },
          {
            label: 'แก้ไข/ยกเลิกหลังรับ',
            value: inRound.filter((o) => o.editedAfterAccept || o.status === 'cancelled').length,
            color: 'brand',
          },
        ]}
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Tabs value={tab} onChange={setTab}>
            <Tabs.List>
              <Tabs.Tab value="all">ทั้งหมด ({inRound.length})</Tabs.Tab>
              {db.carriers.map((c) => (
                <Tabs.Tab key={c.id} value={c.id}>
                  {c.name} ({inRound.filter((o) => o.carrierId === c.id).length})
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <Group justify="space-between">
            <Text size="sm">
              เลือก <b>{selected.length}</b> รายการ
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                variant="default"
                disabled={!rows.some(selectable)}
                onClick={() => setSelected(rows.filter(selectable))}
              >
                เลือกที่รอรับทั้งหมด
              </Button>
              <Button
                size="xs"
                disabled={selected.length === 0}
                onClick={() => setToAccept(selected)}
              >
                รับ Order
              </Button>
            </Group>
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            highlightOnHover
            minHeight={200}
            idAccessor="orderNumber"
            records={rows}
            noRecordsText="ไม่มี Order ในรอบนี้"
            selectedRecords={selected}
            onSelectedRecordsChange={setSelected}
            isRecordSelectable={selectable}
            rowColor={(r) =>
              r.editedAfterAccept || r.status === 'cancelled' ? 'brand' : undefined
            }
            columns={[
              {
                accessor: 'orderNumber',
                title: 'เลข Order',
                render: (r) => (
                  <AnchorLink
                    to="/orders/$orderId"
                    params={{ orderId: r.orderNumber }}
                    fw={600}
                    size="sm"
                  >
                    {r.orderNumber}
                  </AnchorLink>
                ),
              },
              { accessor: 'channel', title: 'ช่องทาง', render: (r) => CHANNEL_LABEL_TH[r.channel] },
              { accessor: 'customerName', title: 'ลูกค้า' },
              { accessor: 'items', title: 'สินค้า', render: (r) => itemsText(r, db.products) },
              { accessor: 'carrierId', title: 'ขนส่ง', render: (r) => carrierName(r.carrierId) },
              {
                accessor: 'status',
                title: 'สถานะ',
                render: (r) => <OrderStatusBadge status={r.status} />,
              },
              {
                accessor: 'note',
                title: 'หมายเหตุ',
                render: (r) => {
                  if (r.status === 'cancelled')
                    return <StatusBadge color="brand">ยกเลิกหลังรับ</StatusBadge>;
                  if (r.editedAfterAccept)
                    return (
                      <UnstyledButton onClick={() => setFlagged(r)}>
                        <Badge color="brand" variant="light" radius="xl" tt="none">
                          แก้ไขหลังรับ · ดู
                        </Badge>
                      </UnstyledButton>
                    );
                  if (r.insertedAfterCutoff)
                    return <StatusBadge color="orange">แทรกหลังตัดรอบ</StatusBadge>;
                  return '—';
                },
              },
              {
                accessor: 'actions',
                title: '',
                textAlign: 'right',
                render: (r) =>
                  r.status === 'confirmed' && (
                    <Button size="compact-xs" variant="default" onClick={() => setToAccept([r])}>
                      รับ
                    </Button>
                  ),
              },
            ]}
          />
        </Stack>
      </Paper>

      <ConfirmModal
        opened={toAccept.length > 0}
        onClose={() => setToAccept([])}
        title={`รับ Order ${toAccept.length} รายการ`}
        confirmLabel="ยืนยันรับ Order"
        doneMessage={`รับ Order ${toAccept.length} รายการแล้ว`}
        onConfirm={() => {
          acceptOrders(toAccept.map((o) => o.orderNumber));
          setSelected([]);
        }}
      >
        {toAccept.slice(0, 20).map((o) => (
          <Paper key={o.orderNumber} withBorder p="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text fw={600}>{o.orderNumber}</Text>
                <Text size="xs" c="dimmed">
                  {CHANNEL_LABEL_TH[o.channel]} · {o.customerName}
                  {o.insertedAfterCutoff && ' · แทรกหลังตัดรอบ'}
                </Text>
              </div>
              <Text size="sm">{carrierName(o.carrierId)}</Text>
            </Group>
          </Paper>
        ))}
        {toAccept.length > 20 && (
          <Text size="sm" c="dimmed">
            และอีก {toAccept.length - 20} รายการ
          </Text>
        )}
        <Alert color="blue" variant="light">
          สถานะจะเปลี่ยนเป็น &quot;โรงงานรับแล้ว&quot; · หลังจากนี้ถ้า Sales แก้ไขหรือยกเลิก ระบบจะแจ้งเตือนโรงงาน
        </Alert>
      </ConfirmModal>
      <EditedAfterAcceptModal
        opened={flagged !== null}
        onClose={() => setFlagged(null)}
        order={flagged}
      />
    </Stack>
  );
}
