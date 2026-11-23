import {
  Alert,
  Badge,
  Button,
  Group,
  NumberInput,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AnchorLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  markDelivered,
  nowThai,
  recordShortShipment,
  recordTracking,
} from '@/features/mock/actions';
import { isMarketplace, PLATFORM_OF } from '@/features/mock/catalog';
import { carrierName } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import type { CarrierId, MockOrder } from '@/features/mock/types';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { SlipThumbnails } from '@/features/orders/components/SlipThumbnails';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { formatThaiDate } from '@/lib/dayjs';
import { notifyDone } from '@/lib/notify';

/** 04-04 Shipping: tracking numbers, platform sync, delivery confirmation (SRS 25–27, pending) */
export const Route = createFileRoute('/_app/factory/shipping')({
  component: ShippingPage,
});

type ShipTab = 'wait' | 'shipped' | 'done' | 'short' | 'all';

function tabOf(o: MockOrder): ShipTab | null {
  if (o.status === 'factory_accepted') return 'wait';
  if (o.status === 'shipped') return 'shipped';
  if (o.status === 'delivered') return 'done';
  if (o.status === 'partially_shipped') return 'short';
  return null;
}

const SYNC: Record<MockOrder['sync'], { label: string; color: string }> = {
  none: { label: 'ไม่ต้อง sync', color: 'gray' },
  waiting: { label: 'รอ Tracking', color: 'orange' },
  ok: { label: 'สำเร็จ', color: 'green' },
  error: { label: 'sync ไม่สำเร็จ', color: 'brand' },
};

const PAGE_SIZE = 25;

function ShippingPage() {
  const db = useMockDb();
  const [tab, setTab] = useState<string | null>('wait');
  const [page, setPage] = useState(1);
  const [tracking, setTracking] = useState<MockOrder | null>(null);
  const [short, setShort] = useState<MockOrder | null>(null);
  const [delivered, setDelivered] = useState<MockOrder | null>(null);

  const shippable = db.orders.filter((o) => tabOf(o) !== null);
  const count = (t: ShipTab) => shippable.filter((o) => tabOf(o) === t).length;
  const rows = shippable
    .filter((o) => tab === 'all' || tabOf(o) === tab)
    .toSorted((a, b) =>
      tab === 'wait'
        ? a.roundDate.localeCompare(b.roundDate)
        : (b.shippedAt ?? b.orderedAt).localeCompare(a.shippedAt ?? a.orderedAt),
    );
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstWaiting = shippable.find((o) => tabOf(o) === 'wait');

  const tabs: { value: ShipTab; label: string }[] = [
    { value: 'wait', label: `รอจัดส่ง (${count('wait')})` },
    { value: 'shipped', label: `จัดส่งแล้ว (${count('shipped')})` },
    { value: 'done', label: `จัดส่งสำเร็จ (${count('done')})` },
    { value: 'short', label: `ส่งไม่ครบ (${count('short')})` },
    { value: 'all', label: 'ทั้งหมด' },
  ];

  return (
    <Stack>
      <PageHeader
        title="การจัดส่ง"
        description="บันทึกเลข Tracking ติดตามสถานะ และ sync กลับ Platform"
        pending
        actions={
          <Button onClick={() => setTracking(firstWaiting ?? null)} disabled={!firstWaiting}>
            บันทึก Tracking
          </Button>
        }
      />
      <Alert color="orange" variant="light">
        ข้อ 25–26 ยังไม่ Sign off · ข้อเสนอ: เมื่อได้เลข Tracking (จาก API ขนส่งหรือคีย์เอง) ระบบเปลี่ยนเป็น
        &quot;จัดส่งแล้ว&quot; อัตโนมัติและ sync กลับ Platform{' '}
        <Badge size="xs" variant="outline" color="orange">
          ข้อเสนอ
        </Badge>
      </Alert>
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Tabs
            value={tab}
            onChange={(v) => {
              setTab(v);
              setPage(1);
            }}
          >
            <Tabs.List>
              {tabs.map((t) => (
                <Tabs.Tab key={t.value} value={t.value}>
                  {t.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <DataTable
            withTableBorder
            borderRadius="md"
            minHeight={200}
            idAccessor="orderNumber"
            records={pageRows}
            totalRecords={rows.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
            noRecordsText="ไม่มีรายการ"
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
              { accessor: 'customerName', title: 'ลูกค้า' },
              { accessor: 'carrierId', title: 'ขนส่ง', render: (r) => carrierName(r.carrierId) },
              {
                accessor: 'tracking',
                title: 'เลข Tracking',
                render: (r) =>
                  r.tracking ? (
                    <Text ff="monospace" size="sm">
                      {r.tracking}
                    </Text>
                  ) : (
                    '—'
                  ),
              },
              {
                accessor: 'trackingSource',
                title: 'ที่มา',
                render: (r) => {
                  if (r.trackingSource === 'api')
                    return <StatusBadge color="blue">API ขนส่ง</StatusBadge>;
                  if (r.trackingSource === 'manual') return <StatusBadge>คีย์เอง</StatusBadge>;
                  return '—';
                },
              },
              {
                accessor: 'sync',
                title: 'Sync Platform',
                render: (r) => (
                  <StatusBadge color={SYNC[r.sync].color}>{SYNC[r.sync].label}</StatusBadge>
                ),
              },
              {
                accessor: 'status',
                title: 'สถานะ',
                render: (r) => <OrderStatusBadge status={r.status} />,
              },
              {
                accessor: 'action',
                title: '',
                textAlign: 'right',
                render: (r) => {
                  if (r.status === 'factory_accepted')
                    return (
                      <Button size="compact-xs" variant="default" onClick={() => setTracking(r)}>
                        บันทึก Tracking
                      </Button>
                    );
                  if (r.status === 'shipped')
                    return (
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Button size="compact-xs" variant="default" onClick={() => setShort(r)}>
                          ส่งไม่ครบ
                        </Button>
                        <Button size="compact-xs" variant="default" onClick={() => setDelivered(r)}>
                          ยืนยันส่งสำเร็จ
                        </Button>
                      </Group>
                    );
                  return null;
                },
              },
            ]}
          />
        </Stack>
      </Paper>

      {tracking && (
        <TrackingModal
          key={tracking.orderNumber}
          order={tracking}
          onClose={() => setTracking(null)}
        />
      )}
      {short && (
        <ShortShipmentModal key={short.orderNumber} order={short} onClose={() => setShort(null)} />
      )}
      {delivered && (
        <DeliveredModal
          key={delivered.orderNumber}
          order={delivered}
          onClose={() => setDelivered(null)}
        />
      )}
    </Stack>
  );
}

function OrderHeader({ order }: { order: MockOrder }) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Group justify="space-between">
        <div>
          <Text fw={600}>{order.orderNumber}</Text>
          <Text size="xs" c="dimmed">
            {CHANNEL_LABEL_TH[order.channel]} · {order.customerName} ·{' '}
            {carrierName(order.carrierId)}
          </Text>
        </div>
        <OrderStatusBadge status={order.status} />
      </Group>
    </Paper>
  );
}

function TrackingModal({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const db = useMockDb();
  const [carrier, setCarrier] = useState<CarrierId>(order.carrierId);
  const [no, setNo] = useState('');
  const platform = PLATFORM_OF[order.channel];
  const prefix = db.carriers.find((c) => c.id === carrier)?.trackingPrefix ?? '';
  return (
    <ConfirmModal
      opened
      onClose={onClose}
      title="บันทึกเลข Tracking"
      confirmLabel="บันทึก"
      confirmDisabled={no.trim() === ''}
      doneMessage={
        platform ? `บันทึก Tracking และ sync กลับ ${platform} แล้ว` : 'บันทึก Tracking แล้ว · จัดส่งแล้ว'
      }
      onConfirm={() => recordTracking(order.orderNumber, carrier, no.trim())}
    >
      <OrderHeader order={order} />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Select
          label="ขนส่ง"
          data={db.carriers.map((c) => ({ value: c.id, label: c.name }))}
          value={carrier}
          onChange={(v) => {
            const next = db.carriers.find((c) => c.id === v);
            if (next) setCarrier(next.id);
          }}
        />
        <TextInput label="วันที่ส่ง" value={formatThaiDate(nowThai(), 'DD/MM/BBBB')} readOnly />
        <TextInput
          label="เลข Tracking"
          withAsterisk
          placeholder={`${prefix}…`}
          value={no}
          onChange={(e) => setNo(e.currentTarget.value)}
          description="หรือกดดึงจาก API ขนส่ง"
          style={{ gridColumn: '1 / -1' }}
        />
      </SimpleGrid>
      <Button
        variant="default"
        w="fit-content"
        onClick={() => {
          setNo(`${prefix}${Math.floor(10000000 + Math.random() * 89999999)}`);
          notifyDone('ดึงเลข Tracking สำเร็จ (ตัวอย่าง)');
        }}
      >
        ดึงเลข Tracking จาก API ขนส่ง
      </Button>
      <Alert color="blue" variant="light">
        เมื่อบันทึก ระบบจะเปลี่ยนสถานะเป็น &quot;จัดส่งแล้ว&quot;
        {isMarketplace(order.channel) && ` และส่งเลข Tracking กลับ ${platform ?? 'Platform'}`}
      </Alert>
    </ConfirmModal>
  );
}

function DeliveredModal({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const [receiver, setReceiver] = useState('');
  return (
    <ConfirmModal
      opened
      onClose={onClose}
      title="ยืนยันจัดส่งสำเร็จ"
      confirmLabel="ยืนยันส่งสำเร็จ"
      doneMessage="ปิด Order เป็นจัดส่งสำเร็จแล้ว"
      onConfirm={() => markDelivered(order.orderNumber, receiver.trim() || undefined)}
    >
      <OrderHeader order={order} />
      <Text size="xs" c="dimmed">
        ใช้กับรถตู้/รถทัวร์ และส่งจากหน้าร้าน · ขนส่งอื่นปิดงานอัตโนมัติจาก Platform/API
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          label="ผู้รับสินค้า"
          placeholder="ชื่อผู้รับ"
          value={receiver}
          onChange={(e) => setReceiver(e.currentTarget.value)}
        />
        <TextInput
          label="วันเวลาที่ส่งถึง"
          defaultValue={formatThaiDate(nowThai(), 'DD/MM/BBBB HH:mm')}
        />
      </SimpleGrid>
      <div>
        <Text size="sm" fw={500} mb={4}>
          หลักฐานการส่ง (ถ้ามี)
        </Text>
        <SlipThumbnails count={0} />
      </div>
    </ConfirmModal>
  );
}

function ShortShipmentModal({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const [sent, setSent] = useState<Record<string, number>>(() =>
    Object.fromEntries(order.lines.map((l) => [l.productId, l.shippedQty ?? l.qty])),
  );
  return (
    <ConfirmModal
      opened
      onClose={onClose}
      title="บันทึกส่งไม่ครบ"
      confirmLabel="บันทึก"
      confirmDisabled={order.lines.every((l) => (sent[l.productId] ?? l.qty) >= l.qty)}
      doneMessage="บันทึกส่งไม่ครบแล้ว"
      onConfirm={() => recordShortShipment(order.orderNumber, sent)}
    >
      <Alert color="orange" variant="light">
        ข้อ 26 ยังไม่ Sign off · ส่วนที่เหลือจะส่งรอบหน้าหรือคืนเงิน รอยืนยัน (Q10)
      </Alert>
      <OrderHeader order={order} />
      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>สินค้า</Table.Th>
            <Table.Th ta="right">สั่ง</Table.Th>
            <Table.Th ta="right">ส่งจริง</Table.Th>
            <Table.Th ta="right">ขาด</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {order.lines.map((l) => {
            const value = sent[l.productId] ?? l.qty;
            return (
              <Table.Tr key={l.productId}>
                <Table.Td>{l.name}</Table.Td>
                <Table.Td ta="right">{l.qty}</Table.Td>
                <Table.Td w={110}>
                  <NumberInput
                    size="xs"
                    min={0}
                    max={l.qty}
                    value={value}
                    onChange={(v) => setSent({ ...sent, [l.productId]: Number(v) || 0 })}
                  />
                </Table.Td>
                <Table.Td ta="right" fw={700}>
                  {l.qty - value}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <Radio.Group label="ส่วนที่ขาด" defaultValue="next">
        <Stack gap="xs" mt="xs">
          <Radio value="next" label="ส่งในรอบถัดไป (สร้าง Order ส่งเพิ่มอัตโนมัติ)" />
          <Radio value="refund" label="คืนเงินส่วนที่ขาด (ออกใบลดหนี้)" />
          <Radio value="pending" label="ยังไม่ตัดสินใจ · แจ้งหัวหน้า" />
        </Stack>
      </Radio.Group>
      <Textarea label="สาเหตุ" placeholder="เช่น ผลิตไม่ทัน สินค้าเสียหาย" />
    </ConfirmModal>
  );
}
