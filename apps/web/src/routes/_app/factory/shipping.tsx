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
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SHIP_ROWS, type ShipTab } from '@/features/factory/mock-data';
import { SlipThumbnails } from '@/features/orders/components/SlipThumbnails';
import { notifyDone } from '@/lib/notify';

/** 04-04 Shipping: tracking numbers, platform sync, delivery confirmation (SRS 25–27, pending) */
export const Route = createFileRoute('/_app/factory/shipping')({
  component: ShippingPage,
});

const TABS: { value: ShipTab | 'all'; label: string; count?: number }[] = [
  { value: 'wait', label: 'รอจัดส่ง', count: 12 },
  { value: 'shipped', label: 'จัดส่งแล้ว', count: 40 },
  { value: 'done', label: 'จัดส่งสำเร็จ', count: 132 },
  { value: 'short', label: 'ส่งไม่ครบ', count: 1 },
  { value: 'all', label: 'ทั้งหมด' },
];

function ShippingPage() {
  const [tab, setTab] = useState<string | null>('wait');
  const [trackOpened, track] = useDisclosure(false);
  const [shortOpened, short] = useDisclosure(false);
  const [deliveredOpened, delivered] = useDisclosure(false);
  const rows = SHIP_ROWS.filter((r) => tab === 'all' || r.tab === tab);

  return (
    <Stack>
      <PageHeader
        title="การจัดส่ง"
        description="บันทึกเลข Tracking ติดตามสถานะ และ sync กลับ Platform"
        pending
        actions={
          <>
            <Button variant="default" onClick={short.open}>
              บันทึกส่งไม่ครบ
            </Button>
            <Button onClick={track.open}>บันทึก Tracking</Button>
          </>
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
          <Tabs value={tab} onChange={setTab}>
            <Tabs.List>
              {TABS.map((t) => (
                <Tabs.Tab key={t.value} value={t.value}>
                  {t.label}
                  {t.count !== undefined && ` (${t.count})`}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <DataTable
            withTableBorder
            borderRadius="md"
            idAccessor="orderNumber"
            records={rows}
            noRecordsText="ไม่มีรายการ"
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
              { accessor: 'customer', title: 'ลูกค้า' },
              { accessor: 'carrier', title: 'ขนส่ง' },
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
                accessor: 'source',
                title: 'ที่มา',
                render: (r) => {
                  if (r.source === 'api') return <StatusBadge color="blue">API ขนส่ง</StatusBadge>;
                  if (r.source === 'manual') return <StatusBadge>คีย์เอง</StatusBadge>;
                  return '—';
                },
              },
              {
                accessor: 'sync',
                title: 'Sync Platform',
                render: (r) => <StatusBadge color={r.sync.color}>{r.sync.label}</StatusBadge>,
              },
              {
                accessor: 'status',
                title: 'สถานะ',
                render: (r) => <StatusBadge color={r.status.color}>{r.status.label}</StatusBadge>,
              },
              {
                accessor: 'action',
                title: '',
                textAlign: 'right',
                render: (r) => {
                  if (r.action === 'track')
                    return (
                      <Button size="compact-xs" variant="default" onClick={track.open}>
                        บันทึก Tracking
                      </Button>
                    );
                  if (r.action === 'delivered')
                    return (
                      <Button size="compact-xs" variant="default" onClick={delivered.open}>
                        ยืนยันส่งสำเร็จ
                      </Button>
                    );
                  if (r.action === 'short')
                    return (
                      <Button size="compact-xs" variant="default" onClick={short.open}>
                        ดูรายละเอียด
                      </Button>
                    );
                  return null;
                },
              },
            ]}
          />
        </Stack>
      </Paper>

      <TrackingModal opened={trackOpened} onClose={track.close} />
      <ShortShipmentModal opened={shortOpened} onClose={short.close} />
      <ConfirmModal
        opened={deliveredOpened}
        onClose={delivered.close}
        title="ยืนยันจัดส่งสำเร็จ"
        confirmLabel="ยืนยันส่งสำเร็จ"
        doneMessage="ปิด Order เป็นจัดส่งสำเร็จแล้ว"
      >
        <Paper withBorder p="sm" radius="md">
          <Text fw={600}>ORD-000137</Text>
          <Text size="xs" c="dimmed">
            รถตู้/รถทัวร์ · ลูกค้าหน้าร้าน
          </Text>
        </Paper>
        <Text size="xs" c="dimmed">
          ใช้กับรถตู้/รถทัวร์ และส่งจากหน้าร้าน · ขนส่งอื่นปิดงานอัตโนมัติจาก Platform/API
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="ผู้รับสินค้า" placeholder="ชื่อผู้รับ" />
          <TextInput label="วันเวลาที่ส่งถึง" defaultValue="13/11/2569 15:30" />
        </SimpleGrid>
        <div>
          <Text size="sm" fw={500} mb={4}>
            หลักฐานการส่ง (ถ้ามี)
          </Text>
          <SlipThumbnails count={1} />
        </div>
      </ConfirmModal>
    </Stack>
  );
}

function TrackingModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="บันทึกเลข Tracking"
      confirmLabel="บันทึก"
      doneMessage="บันทึก Tracking และ sync กลับ Shopee แล้ว"
    >
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between">
          <div>
            <Text fw={600}>ORD-000142</Text>
            <Text size="xs" c="dimmed">
              Shopee · สมชาย ใจดี
            </Text>
          </div>
          <StatusBadge>โรงงานรับแล้ว</StatusBadge>
        </Group>
      </Paper>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Select
          label="ขนส่ง"
          data={['Inter Express', 'Nim Express', 'Fuze Express', 'รถตู้/รถทัวร์', 'ส่งจากหน้าร้าน']}
          defaultValue="Inter Express"
        />
        <TextInput label="วันที่ส่ง" defaultValue="13/11/2569" />
        <TextInput
          label="เลข Tracking"
          withAsterisk
          defaultValue="IE66113000"
          description="หรือกดดึงจาก API ขนส่ง"
          style={{ gridColumn: '1 / -1' }}
        />
      </SimpleGrid>
      <Button variant="default" w="fit-content" onClick={() => notifyDone('ดึงเลข Tracking สำเร็จ')}>
        ดึงเลข Tracking จาก API ขนส่ง
      </Button>
      <Alert color="blue" variant="light">
        เมื่อบันทึก ระบบจะเปลี่ยนสถานะเป็น &quot;จัดส่งแล้ว&quot; และส่งเลข Tracking กลับ Shopee
      </Alert>
    </ConfirmModal>
  );
}

function ShortShipmentModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [lines, setLines] = useState([
    { name: 'เต้าหู้ แพ็ค 10', ordered: 6, sent: 4 },
    { name: 'น้ำจิ้ม 400g', ordered: 2, sent: 2 },
  ]);
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="บันทึกส่งไม่ครบ"
      confirmLabel="บันทึก"
      doneMessage="บันทึกส่งไม่ครบแล้ว"
    >
      <Alert color="orange" variant="light">
        ข้อ 26 ยังไม่ Sign off · ส่วนที่เหลือจะส่งรอบหน้าหรือคืนเงิน รอยืนยัน (Q10)
      </Alert>
      <Text size="sm">
        <b>ORD-000126</b>{' '}
        <Text span c="dimmed">
          · ครัวป้าศรี · Nim Express
        </Text>
      </Text>
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
          {lines.map((l, i) => (
            <Table.Tr key={l.name}>
              <Table.Td>{l.name}</Table.Td>
              <Table.Td ta="right">{l.ordered}</Table.Td>
              <Table.Td w={110}>
                <NumberInput
                  size="xs"
                  min={0}
                  max={l.ordered}
                  value={l.sent}
                  onChange={(v) =>
                    setLines(lines.map((x, j) => (j === i ? { ...x, sent: Number(v) || 0 } : x)))
                  }
                />
              </Table.Td>
              <Table.Td ta="right" fw={700}>
                {l.ordered - l.sent}
              </Table.Td>
            </Table.Tr>
          ))}
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
