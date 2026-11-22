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
import { useDisclosure } from '@mantine/hooks';
import { IconPrinter } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditedAfterAcceptModal } from '@/features/factory/components/FactoryModals';
import {
  CARRIER_TABS,
  QUEUE_ROWS,
  ROUND_OPTIONS,
  type QueueRow,
} from '@/features/factory/mock-data';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';

/** 04-01 Factory order queue (SRS 20, 21, 28) */
export const Route = createFileRoute('/_app/factory/')({
  component: FactoryQueuePage,
});

function FactoryQueuePage() {
  const [round, setRound] = useState('13');
  const [tab, setTab] = useState<string | null>('all');
  const [selected, setSelected] = useState<QueueRow[]>(() => QUEUE_ROWS.slice(0, 2));
  const [toAccept, setToAccept] = useState<QueueRow[]>([]);
  const [flagOpened, flag] = useDisclosure(false);

  const rows = QUEUE_ROWS.filter((r) => tab === 'all' || r.carrierKey === tab);
  const openAccept = (list: QueueRow[]) => setToAccept(list);

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
            <Button disabled={selected.length === 0} onClick={() => openAccept(selected)}>
              รับ Order ที่เลือก
            </Button>
          </>
        }
      />
      <Alert color="gold" variant="light">
        <Group justify="space-between">
          <Text size="sm">รอบ 13 พ.ย. 2569 · ตัดรอบ 12:00 น. · เหลือเวลา 1 ชม. 25 นาที</Text>
          <SegmentedControl
            size="xs"
            radius="xl"
            value={round}
            onChange={setRound}
            data={ROUND_OPTIONS}
          />
        </Group>
      </Alert>
      <StatGrid
        items={[
          { label: 'รอโรงงานรับ', value: 28, color: 'blue' },
          { label: 'โรงงานรับแล้ว', value: 15, color: 'gray' },
          { label: 'แทรกหลังตัดรอบ', value: 1, color: 'orange' },
          { label: 'แก้ไข/ยกเลิกหลังรับ', value: 2, color: 'brand' },
        ]}
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Tabs value={tab} onChange={setTab}>
            <Tabs.List>
              <Tabs.Tab value="all">ทั้งหมด (46)</Tabs.Tab>
              {CARRIER_TABS.map((c) => (
                <Tabs.Tab key={c.value} value={c.value}>
                  {c.label} ({c.count})
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
                disabled={selected.length === 0}
                onClick={() => openAccept(selected)}
              >
                รับ Order
              </Button>
              <Button size="xs" variant="default" component={Link} to="/factory/print">
                พิมพ์ใบจัดสินค้า
              </Button>
            </Group>
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            highlightOnHover
            idAccessor="orderNumber"
            records={rows}
            selectedRecords={selected}
            onSelectedRecordsChange={setSelected}
            rowColor={(r) => (r.note === 'edited' ? 'brand' : undefined)}
            columns={[
              {
                accessor: 'orderNumber',
                title: 'เลข Order',
                render: (r) => (
                  <Text fw={600} size="sm">
                    {r.orderNumber}
                  </Text>
                ),
              },
              { accessor: 'channel', title: 'ช่องทาง' },
              { accessor: 'customer', title: 'ลูกค้า' },
              { accessor: 'items', title: 'สินค้า' },
              { accessor: 'carrier', title: 'ขนส่ง' },
              {
                accessor: 'status',
                title: 'สถานะ',
                render: (r) => <OrderStatusBadge status={r.status} />,
              },
              {
                accessor: 'note',
                title: 'หมายเหตุ',
                render: (r) => {
                  if (r.note === 'inserted')
                    return <StatusBadge color="orange">แทรกหลังตัดรอบ</StatusBadge>;
                  if (r.note === 'edited')
                    return (
                      <UnstyledButton onClick={flag.open}>
                        <Badge color="brand" variant="light" radius="xl" tt="none">
                          แก้ไขหลังรับ · ดู
                        </Badge>
                      </UnstyledButton>
                    );
                  return '—';
                },
              },
              {
                accessor: 'actions',
                title: '',
                textAlign: 'right',
                render: (r) =>
                  r.status === 'confirmed' && (
                    <Button size="compact-xs" variant="default" onClick={() => openAccept([r])}>
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
      >
        {toAccept.map((o) => (
          <Paper key={o.orderNumber} withBorder p="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text fw={600}>{o.orderNumber}</Text>
                <Text size="xs" c="dimmed">
                  {o.channel} · {o.customer}
                  {o.note === 'inserted' && ' · แทรกหลังตัดรอบ'}
                </Text>
              </div>
              <Text size="sm">{o.carrier}</Text>
            </Group>
          </Paper>
        ))}
        <Alert color="blue" variant="light">
          สถานะจะเปลี่ยนเป็น &quot;โรงงานรับแล้ว&quot; · หลังจากนี้ถ้า Sales แก้ไขหรือยกเลิก ระบบจะแจ้งเตือนโรงงาน
        </Alert>
      </ConfirmModal>
      <EditedAfterAcceptModal opened={flagOpened} onClose={flag.close} />
    </Stack>
  );
}
