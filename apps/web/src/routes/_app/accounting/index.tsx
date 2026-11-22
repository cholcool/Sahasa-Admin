import {
  Alert,
  Button,
  Checkbox,
  Paper,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFileExport } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { splitVat } from '@/features/accounting/vat';
import { formatAmount } from '@/lib/format';

/** 05-01 Revenue recognition (SRS 29, pending client confirmation) */
export const Route = createFileRoute('/_app/accounting/')({
  component: RevenuePage,
});

type RevState = 'wait' | 'sent' | 'err';

const STATE: Record<RevState, { label: string; color: string }> = {
  wait: { label: 'รอส่ง', color: 'orange' },
  sent: { label: 'ส่งแล้ว', color: 'green' },
  err: { label: 'ผิดพลาด', color: 'brand' },
};

// TODO: replace with revenue API
const ROWS = [
  {
    at: '13 พ.ย. 09:20',
    order: 'ORD-000141',
    channel: 'Line',
    customer: 'ร้านเจ๊หมวย',
    billing: 'NOVAT',
    total: 1250,
    state: 'wait' as RevState,
  },
  {
    at: '13 พ.ย. 09:05',
    order: 'ORD-000139',
    channel: 'Facebook',
    customer: 'บจก. สยามฟู้ด',
    billing: 'VAT',
    total: 570,
    state: 'wait' as RevState,
  },
  {
    at: '12 พ.ย. 16:40',
    order: 'ORD-000130',
    channel: 'Line',
    customer: 'บจก. สยามฟู้ด',
    billing: 'VAT',
    total: 2850,
    state: 'sent' as RevState,
  },
  {
    at: '12 พ.ย. 15:10',
    order: 'ORD-000127',
    channel: 'โทร',
    customer: 'ครัวป้าศรี',
    billing: 'VAT',
    total: 950,
    state: 'err' as RevState,
    error: 'ไม่มีเลขผู้เสียภาษี',
  },
];

function RevenuePage() {
  const [tab, setTab] = useState<string | null>('all');
  const [exportOpened, exportModal] = useDisclosure(false);
  const [format, setFormat] = useState('CSV ทั่วไป');
  const rows = ROWS.filter((r) => tab === 'all' || r.state === tab);

  return (
    <Stack>
      <PageHeader
        title="รับรู้รายได้"
        description="ข้อมูลรับรู้รายได้ เกิดเมื่อยืนยัน Order"
        pending
        actions={
          <Button leftSection={<IconFileExport size={16} />} onClick={exportModal.open}>
            ส่งออกไปโปรแกรมบัญชี
          </Button>
        }
      />
      <Alert color="orange" variant="light">
        จุดรับรู้รายได้ (Q16) และโปรแกรมบัญชีปลายทาง (Q21) รอยืนยัน · ตอนนี้ตั้งไว้ที่ &quot;ยืนยัน Order&quot;
      </Alert>
      <StatGrid
        items={[
          { label: 'รายได้วันนี้', value: '฿58,940', color: 'green' },
          { label: 'รอส่งข้อมูล', value: 18, color: 'orange' },
          { label: 'ส่งแล้วเดือนนี้', value: 214, color: 'blue' },
          { label: 'ส่งไม่สำเร็จ', value: 1, color: 'brand' },
        ]}
      />
      <Paper withBorder radius="lg" p="md">
        <Tabs value={tab} onChange={setTab} mb="sm">
          <Tabs.List>
            <Tabs.Tab value="all">ทั้งหมด</Tabs.Tab>
            <Tabs.Tab value="wait">รอส่ง (18)</Tabs.Tab>
            <Tabs.Tab value="sent">ส่งแล้ว</Tabs.Tab>
            <Tabs.Tab value="err">ผิดพลาด (1)</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="order"
          records={rows}
          rowColor={(r) => (r.state === 'err' ? 'brand' : undefined)}
          columns={[
            { accessor: 'at', title: 'วันที่รับรู้' },
            {
              accessor: 'order',
              title: 'เลข Order',
              render: (r) => (
                <Text fw={600} size="sm">
                  {r.order}
                </Text>
              ),
            },
            { accessor: 'channel', title: 'ช่องทาง' },
            { accessor: 'customer', title: 'ลูกค้า' },
            { accessor: 'billing', title: 'บิล' },
            {
              accessor: 'base',
              title: 'ก่อน VAT',
              textAlign: 'right',
              render: (r) => formatAmount(r.billing === 'VAT' ? splitVat(r.total).base : r.total),
            },
            {
              accessor: 'vat',
              title: 'VAT',
              textAlign: 'right',
              render: (r) => (r.billing === 'VAT' ? formatAmount(splitVat(r.total).vat) : '—'),
            },
            {
              accessor: 'total',
              title: 'ยอดรวม',
              textAlign: 'right',
              render: (r) => formatAmount(r.total),
            },
            {
              accessor: 'state',
              title: 'สถานะ',
              render: (r) => (
                <StatusBadge color={STATE[r.state].color}>
                  {r.error ?? STATE[r.state].label}
                </StatusBadge>
              ),
            },
          ]}
        />
      </Paper>

      <ConfirmModal
        opened={exportOpened}
        onClose={exportModal.close}
        title="ส่งออกข้อมูลบัญชี"
        confirmLabel="ส่งออก"
        doneMessage="ส่งออก 18 รายการแล้ว"
      >
        <TextInput label="ช่วงวันที่" defaultValue="1–13 พ.ย. 2569" />
        <div>
          <Text size="sm" fw={500} mb={4}>
            รูปแบบไฟล์ (รอยืนยันโปรแกรมบัญชี Q21)
          </Text>
          <SegmentedControl
            data={['Express', 'FlowAccount', 'PEAK', 'CSV ทั่วไป']}
            value={format}
            onChange={setFormat}
          />
        </div>
        <Paper withBorder p="sm" radius="md">
          <Stack gap={4}>
            <KeyValue label="รายการที่ส่งออก">18 รายการ</KeyValue>
            <KeyValue label="ยอดรวม">฿24,380.00</KeyValue>
          </Stack>
        </Paper>
        <Checkbox defaultChecked label='ทำเครื่องหมายว่า "ส่งแล้ว" หลังส่งออก' />
      </ConfirmModal>
    </Stack>
  );
}
