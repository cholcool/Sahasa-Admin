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
import { markRevenueSent } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { formatThaiDate, todayIso } from '@/lib/dayjs';
import { formatAmount, formatBaht } from '@/lib/format';

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

const PAGE_SIZE = 25;

function RevenuePage() {
  const [tab, setTab] = useState<string | null>('all');
  const [exportOpened, exportModal] = useDisclosure(false);
  const [format, setFormat] = useState('CSV ทั่วไป');
  const [page, setPage] = useState(1);
  const [markSent, setMarkSent] = useState(true);
  const db = useMockDb();
  const today = todayIso();
  const all = db.orders
    .filter((o) => o.revenue && o.status !== 'cancelled')
    .map((o) => ({
      at: o.revenue?.at ?? o.orderedAt,
      order: o.orderNumber,
      channel: CHANNEL_LABEL_TH[o.channel],
      customer: o.customerName,
      billing: o.billing,
      total: o.total,
      state: o.revenue?.state ?? 'wait',
      error: o.revenue?.error,
    }))
    .toSorted((a, b) => b.at.localeCompare(a.at));
  const rows = all.filter((r) => tab === 'all' || r.state === tab);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const waiting = all.filter((r) => r.state === 'wait');
  const errors = all.filter((r) => r.state === 'err');
  const month = today.slice(0, 7);
  const revenueToday = all
    .filter((r) => r.at.slice(0, 10) === today)
    .reduce((s, r) => s + r.total, 0);
  const waitingTotal = waiting.reduce((s, r) => s + r.total, 0);
  const from = waiting.map((r) => r.at).toSorted()[0];

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
          { label: 'รายได้วันนี้', value: formatBaht(revenueToday), color: 'green' },
          { label: 'รอส่งข้อมูล', value: waiting.length, color: 'orange' },
          {
            label: 'ส่งแล้วเดือนนี้',
            value: all.filter((r) => r.state === 'sent' && r.at.startsWith(month)).length,
            color: 'blue',
          },
          { label: 'ส่งไม่สำเร็จ', value: errors.length, color: 'brand' },
        ]}
      />
      <Paper withBorder radius="lg" p="md">
        <Tabs
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          mb="sm"
        >
          <Tabs.List>
            <Tabs.Tab value="all">ทั้งหมด</Tabs.Tab>
            <Tabs.Tab value="wait">รอส่ง ({waiting.length})</Tabs.Tab>
            <Tabs.Tab value="sent">ส่งแล้ว</Tabs.Tab>
            <Tabs.Tab value="err">ผิดพลาด ({errors.length})</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="order"
          records={pageRows}
          totalRecords={rows.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          minHeight={200}
          noRecordsText="ไม่มีรายการ"
          paginationText={({ from: a, to, totalRecords }) => `${a}–${to} จาก ${totalRecords}`}
          rowColor={(r) => (r.state === 'err' ? 'brand' : undefined)}
          columns={[
            {
              accessor: 'at',
              title: 'วันที่รับรู้',
              render: (r) => formatThaiDate(r.at, 'D MMM HH:mm'),
            },
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
        doneMessage={`ส่งออก ${waiting.length} รายการแล้ว`}
        confirmDisabled={waiting.length === 0}
        onConfirm={() => {
          if (markSent) markRevenueSent(waiting.map((r) => r.order));
        }}
      >
        <TextInput
          label="ช่วงวันที่"
          readOnly
          value={
            from ? `${formatThaiDate(from, 'D MMM')} – ${formatThaiDate(today, 'D MMM BBBB')}` : '-'
          }
        />
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
            <KeyValue label="รายการที่ส่งออก">{waiting.length} รายการ</KeyValue>
            <KeyValue label="ยอดรวม">{formatBaht(waitingTotal, { decimals: true })}</KeyValue>
          </Stack>
        </Paper>
        <Checkbox
          checked={markSent}
          onChange={(e) => setMarkSent(e.currentTarget.checked)}
          label='ทำเครื่องหมายว่า "ส่งแล้ว" หลังส่งออก'
        />
      </ConfirmModal>
    </Stack>
  );
}
