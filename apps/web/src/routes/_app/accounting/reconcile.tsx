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
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatAmount } from '@/lib/format';

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

const ROWS: ReconRow[] = [
  {
    order: 'ORD-000101',
    platformNo: '2611080AB12',
    paidAt: '15 พ.ย.',
    amount: 380,
    fee: -22.8,
    shipping: -40,
    received: 275,
  },
  {
    order: 'ORD-000097',
    platformNo: '2611071CD45',
    paidAt: '15 พ.ย.',
    amount: 570,
    fee: -34.2,
    shipping: -40,
    received: 452,
  },
  {
    order: 'ORD-000095',
    platformNo: '2611071EF78',
    paidAt: '15 พ.ย.',
    amount: 190,
    fee: -11.4,
    shipping: -40,
    received: 138.6,
  },
  {
    order: 'ORD-000094',
    platformNo: '2611069GH90',
    paidAt: '15 พ.ย.',
    amount: 950,
    fee: -57,
    shipping: -40,
    received: 853,
  },
];

/** Expected payout and difference, in satang to avoid float drift */
function reconcile(r: ReconRow) {
  const expected = Math.round((r.amount + r.fee + r.shipping) * 100);
  const diff = Math.round(r.received * 100) - expected;
  return { expected: expected / 100, diff: diff / 100 };
}

function ReconcilePage() {
  const [platform, setPlatform] = useState('Shopee');
  const [tab, setTab] = useState<string | null>('all');
  const [uploadOpened, upload] = useDisclosure(false);
  const [checking, setChecking] = useState<ReconRow | null>(null);

  const rows = ROWS.filter((r) => {
    const bad = reconcile(r).diff !== 0;
    return tab === 'all' || (tab === 'bad' ? bad : !bad);
  });

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
          onChange={setPlatform}
          data={['Shopee', 'Lazada', 'TikTok Shop']}
        />
        <Select
          data={['รอบโอน 1–15 พ.ย. 2569', 'รอบโอน 16–31 ต.ค. 2569']}
          defaultValue="รอบโอน 1–15 พ.ย. 2569"
          w={220}
        />
      </Group>
      <StatGrid
        items={[
          { label: 'ยอด Order', value: '฿184,200', color: 'blue' },
          { label: 'ค่าธรรมเนียม', value: '-฿11,052', color: 'orange' },
          { label: 'ค่าส่ง', value: '-฿3,960', color: 'orange' },
          { label: 'ยอดโอนจริง', value: '฿169,062', color: 'green' },
          { label: 'ส่วนต่าง', value: '-฿126', color: 'brand', hint: 'ไม่ตรง 3 รายการ' },
        ]}
      />
      <Paper withBorder radius="lg" p="md">
        <Tabs value={tab} onChange={setTab} mb="sm">
          <Tabs.List>
            <Tabs.Tab value="all">ทั้งหมด (412)</Tabs.Tab>
            <Tabs.Tab value="bad">ไม่ตรง (3)</Tabs.Tab>
            <Tabs.Tab value="ok">ตรง (409)</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="order"
          records={rows}
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
        doneMessage="กระทบยอด 412 รายการแล้ว · ไม่ตรง 3"
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
                <KeyValue label="ค่าธรรมเนียม (ตามสัญญา 6%)">{formatAmount(checking.fee)}</KeyValue>
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
