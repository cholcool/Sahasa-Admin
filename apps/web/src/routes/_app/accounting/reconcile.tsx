import {
  Alert,
  Button,
  FileInput,
  Group,
  Paper,
  Radio,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUpload } from '@tabler/icons-react';
import type { Channel } from '@sahasa/shared';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useMockDb } from '@/features/mock/store';
import { dayjs, formatThaiDate } from '@/lib/dayjs';
import { formatAmount, formatBaht } from '@/lib/format';

/** 05-04 Marketplace payout reconciliation (SRS 34) */
export const Route = createFileRoute('/_app/accounting/reconcile')({
  component: ReconcilePage,
});

interface ReconRow {
  order: string;
  platformNo: string;
  paidAt: string;
  amount: number;
  fee: number;
  shipping: number;
  received: number;
}

/** Expected payout and difference, in satang to avoid float drift */
function reconcile(r: ReconRow) {
  const expected = Math.round((r.amount + r.fee + r.shipping) * 100);
  const diff = Math.round(r.received * 100) - expected;
  return { expected: expected / 100, diff: diff / 100 };
}

const PLATFORMS: { label: string; channel: Channel }[] = [
  { label: 'Shopee', channel: 'shopee' },
  { label: 'Lazada', channel: 'lazada' },
  { label: 'TikTok Shop', channel: 'tiktok' },
];

const PAGE_SIZE = 25;

function periodLabel(paidAt: string): string {
  const d = dayjs(paidAt);
  const from = d.date() === 16 ? d.date(1) : d.subtract(1, 'month').date(16);
  const to = d.date() === 16 ? d.date(15) : d.subtract(1, 'day');
  return `รอบโอน ${from.date()}–${to.date()} ${formatThaiDate(to.format('YYYY-MM-DD'), 'MMM BBBB')}`;
}

function ReconcilePage() {
  const db = useMockDb();
  const [platform, setPlatform] = useState('Shopee');
  const [tab, setTab] = useState<string | null>('all');
  const [page, setPage] = useState(1);
  const [uploadOpened, upload] = useDisclosure(false);
  const [checking, setChecking] = useState<ReconRow | null>(null);

  const channel = PLATFORMS.find((p) => p.label === platform)?.channel ?? 'shopee';
  const payouts = [...new Set(db.settlements.map((s) => s.paidAt))].toSorted().toReversed();
  const [period, setPeriod] = useState<string | null>(payouts[0] ?? null);
  const all: ReconRow[] = db.settlements
    .filter((s) => s.channel === channel && s.paidAt === period)
    .map((s) => ({
      order: s.orderNumber,
      platformNo: s.platformOrderNo,
      paidAt: formatThaiDate(s.paidAt, 'D MMM'),
      amount: s.amount,
      fee: s.fee,
      shipping: s.shipping,
      received: s.received,
    }));
  const bad = all.filter((r) => reconcile(r).diff !== 0);
  const rows = all.filter((r) => {
    const isBad = reconcile(r).diff !== 0;
    return tab === 'all' || (tab === 'bad' ? isBad : !isBad);
  });
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = (key: 'amount' | 'fee' | 'shipping' | 'received') =>
    all.reduce((sum, r) => sum + Math.round(r[key] * 100), 0) / 100;
  const diffTotal = bad.reduce((sum, r) => sum + Math.round(reconcile(r).diff * 100), 0) / 100;

  return (
    <Stack>
      <PageHeader
        title="กระทบยอด Marketplace"
        description="เทียบยอดเงินที่ Platform โอน (หลังหักค่าธรรมเนียม/ค่าส่ง) กับยอด Order"
        actions={
          <Button variant="default" leftSection={<IconUpload size={16} />} onClick={upload.open}>
            อัปโหลดไฟล์ยอดโอน
          </Button>
        }
      />
      <Group justify="space-between">
        <SegmentedControl
          radius="xl"
          value={platform}
          onChange={(v) => {
            setPlatform(v);
            setPage(1);
          }}
          data={PLATFORMS.map((p) => p.label)}
        />
        <Select
          aria-label="รอบโอน"
          data={payouts.map((p) => ({ value: p, label: periodLabel(p) }))}
          value={period}
          onChange={(v) => {
            setPeriod(v);
            setPage(1);
          }}
          placeholder="ยังไม่มีรอบโอน"
          w={240}
        />
      </Group>
      <StatGrid
        items={[
          { label: 'ยอด Order', value: formatBaht(total('amount')), color: 'blue' },
          { label: 'ค่าธรรมเนียม', value: formatBaht(total('fee')), color: 'orange' },
          { label: 'ค่าส่ง', value: formatBaht(total('shipping')), color: 'orange' },
          { label: 'ยอดโอนจริง', value: formatBaht(total('received')), color: 'green' },
          {
            label: 'ส่วนต่าง',
            value: formatBaht(diffTotal),
            color: 'brand',
            hint: `ไม่ตรง ${bad.length} รายการ`,
          },
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
            <Tabs.Tab value="all">ทั้งหมด ({all.length})</Tabs.Tab>
            <Tabs.Tab value="bad">ไม่ตรง ({bad.length})</Tabs.Tab>
            <Tabs.Tab value="ok">ตรง ({all.length - bad.length})</Tabs.Tab>
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
          noRecordsText="ไม่มีรายการในรอบโอนนี้"
          paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
          rowColor={(r) => (reconcile(r).diff !== 0 ? 'brand' : undefined)}
          columns={[
            {
              accessor: 'order',
              title: 'Order',
              render: (r) => (
                <Text fw={600} size="sm">
                  {r.order}
                </Text>
              ),
            },
            {
              accessor: 'platformNo',
              title: 'Platform Order No.',
              render: (r) => (
                <Text ff="monospace" size="sm">
                  {r.platformNo}
                </Text>
              ),
            },
            { accessor: 'paidAt', title: 'วันที่โอน' },
            {
              accessor: 'amount',
              title: 'ยอด Order',
              textAlign: 'right',
              render: (r) => formatAmount(r.amount),
            },
            {
              accessor: 'fee',
              title: 'ค่าธรรมเนียม',
              textAlign: 'right',
              render: (r) => formatAmount(r.fee),
            },
            {
              accessor: 'shipping',
              title: 'ค่าส่ง',
              textAlign: 'right',
              render: (r) => formatAmount(r.shipping),
            },
            {
              accessor: 'expected',
              title: 'ควรได้รับ',
              textAlign: 'right',
              render: (r) => formatAmount(reconcile(r).expected),
            },
            {
              accessor: 'received',
              title: 'โอนจริง',
              textAlign: 'right',
              render: (r) => formatAmount(r.received),
            },
            {
              accessor: 'diff',
              title: 'ส่วนต่าง',
              textAlign: 'right',
              render: (r) => (
                <Text fw={reconcile(r).diff !== 0 ? 700 : 400} size="sm">
                  {formatAmount(reconcile(r).diff)}
                </Text>
              ),
            },
            {
              accessor: 'status',
              title: 'สถานะ',
              render: (r) =>
                reconcile(r).diff !== 0 ? (
                  <StatusBadge color="brand">ไม่ตรง</StatusBadge>
                ) : (
                  <StatusBadge color="green">ตรง</StatusBadge>
                ),
            },
            {
              accessor: 'actions',
              title: '',
              render: (r) =>
                reconcile(r).diff !== 0 && (
                  <Button size="compact-xs" variant="default" onClick={() => setChecking(r)}>
                    ตรวจสอบ
                  </Button>
                ),
            },
          ]}
        />
      </Paper>

      <ConfirmModal
        opened={uploadOpened}
        onClose={upload.close}
        title="อัปโหลดไฟล์ยอดโอน"
        confirmLabel="อัปโหลดและกระทบยอด"
        doneMessage={`กระทบยอด ${all.length} รายการแล้ว · ไม่ตรง ${bad.length}`}
      >
        <Select
          label="Platform"
          data={['Shopee', 'Lazada', 'TikTok Shop']}
          defaultValue={platform}
        />
        <FileInput
          multiple
          label="ไฟล์รายงานรายรับ"
          description="Shopee Income Report (.xlsx) · รองรับหลายไฟล์"
          placeholder="เลือกไฟล์"
          accept=".xlsx,.xls,.csv"
          leftSection={<IconUpload size={16} />}
        />
        <Text size="xs" c="dimmed">
          ถ้าเชื่อม API แล้ว ระบบดึงยอดโอนให้อัตโนมัติทุกวัน
        </Text>
      </ConfirmModal>

      <ConfirmModal
        opened={checking !== null}
        onClose={() => setChecking(null)}
        title={`ตรวจสอบส่วนต่าง · ${checking?.order ?? ''}`}
        confirmLabel="บันทึก"
        doneMessage="บันทึกผลการตรวจสอบแล้ว"
      >
        {checking && (
          <>
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4}>
                <KeyValue label="ยอด Order">{formatAmount(checking.amount)}</KeyValue>
                <KeyValue label="ค่าธรรมเนียม (ตามสัญญา)">{formatAmount(checking.fee)}</KeyValue>
                <KeyValue label="ค่าส่ง">{formatAmount(checking.shipping)}</KeyValue>
                <KeyValue label="ควรได้รับ">{formatAmount(reconcile(checking).expected)}</KeyValue>
                <KeyValue label="Platform โอนจริง">{formatAmount(checking.received)}</KeyValue>
                <KeyValue label="ส่วนต่าง">
                  <b>{formatAmount(reconcile(checking).diff)}</b>
                </KeyValue>
              </Stack>
            </Paper>
            <Alert color="orange" variant="light">
              Platform หักค่าส่งเพิ่ม {formatAmount(Math.abs(reconcile(checking).diff))} (Shipping fee
              adjustment)
            </Alert>
            <Radio.Group label="การจัดการ" defaultValue="accept">
              <Stack gap="xs" mt="xs">
                <Radio value="accept" label="ยอมรับส่วนต่าง (บันทึกเป็นค่าใช้จ่าย)" />
                <Radio value="dispute" label="โต้แย้งกับ Platform" />
              </Stack>
            </Radio.Group>
            <Textarea label="หมายเหตุ" placeholder="บันทึกเพิ่มเติม" />
          </>
        )}
      </ConfirmModal>
    </Stack>
  );
}
