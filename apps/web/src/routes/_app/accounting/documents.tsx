import {
  Button,
  Checkbox,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreditNoteModal } from '@/features/accounting/components/CreditNoteModal';
import { InvoicePreviewModal } from '@/features/accounting/components/InvoicePreviewModal';
import { formatAmount, formatBaht } from '@/lib/format';

/** 05-02 Tax invoices and receipts (SRS 30, 31, 33) */
export const Route = createFileRoute('/_app/accounting/documents')({
  component: AccountingDocumentsPage,
});

const DOCS = [
  {
    no: 'INV-2611-0042',
    kind: 'inv',
    type: 'ใบกำกับเต็มรูป',
    order: 'ORD-000130',
    customer: 'บจก. สยามฟู้ด',
    billing: 'VAT',
    total: 2850,
    date: '12 พ.ย.',
  },
  {
    no: 'INV-2611-0041',
    kind: 'inv',
    type: 'ใบกำกับอย่างย่อ',
    order: 'ORD-000129',
    customer: 'คุณนิด',
    billing: 'VAT',
    total: 570,
    date: '12 พ.ย.',
  },
  {
    no: 'RC-2611-0118',
    kind: 'rc',
    type: 'ใบเสร็จรับเงิน',
    order: 'ORD-000141',
    customer: 'ร้านเจ๊หมวย',
    billing: 'NOVAT',
    total: 1250,
    date: '13 พ.ย.',
  },
  {
    no: 'INV-2611-0038',
    kind: 'inv',
    type: 'ใบกำกับเต็มรูป',
    order: 'ORD-000117',
    customer: 'ครัวป้าศรี',
    billing: 'VAT',
    total: 950,
    date: '10 พ.ย.',
    creditNote: 'CN-2611-0003',
  },
];

const READY = [
  { order: 'ORD-000139', customer: 'บจก. สยามฟู้ด', total: 570 },
  { order: 'ORD-000135', customer: 'บจก. สยามฟู้ด', total: 1900 },
  { order: 'ORD-000132', customer: 'คุณนิด', total: 380 },
];

function AccountingDocumentsPage() {
  const [tab, setTab] = useState<string | null>('all');
  const [preview, setPreview] = useState<string | null>(null);
  const [issueOpened, issue] = useDisclosure(false);
  const [creditOpened, credit] = useDisclosure(false);
  const [checked, setChecked] = useState<string[]>(['ORD-000139', 'ORD-000135']);
  const rows = DOCS.filter((d) => tab === 'all' || d.kind === tab);

  return (
    <Stack>
      <PageHeader
        title="เอกสารบัญชี"
        description="ใบกำกับภาษีและใบเสร็จ ออกตามประเภทการออกบิลของลูกค้า · รันเลขอัตโนมัติแยกตามประเภท"
        actions={<Button onClick={issue.open}>ออกเอกสาร</Button>}
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Tabs value={tab} onChange={setTab}>
            <Tabs.List>
              <Tabs.Tab value="all">ทั้งหมด</Tabs.Tab>
              <Tabs.Tab value="inv">ใบกำกับภาษี (32)</Tabs.Tab>
              <Tabs.Tab value="rc">ใบเสร็จรับเงิน (58)</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={240}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเลขที่เอกสาร, Order, ลูกค้า"
            />
            <Select data={['พ.ย. 2569', 'ต.ค. 2569']} defaultValue="พ.ย. 2569" />
            <Select data={['VAT และ NOVAT', 'VAT', 'NOVAT']} defaultValue="VAT และ NOVAT" />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            idAccessor="no"
            records={rows}
            columns={[
              {
                accessor: 'no',
                title: 'เลขที่เอกสาร',
                render: (r) => (
                  <Text ff="monospace" fw={700} size="sm">
                    {r.no}
                  </Text>
                ),
              },
              { accessor: 'type', title: 'ประเภท' },
              { accessor: 'order', title: 'อ้างอิง Order' },
              { accessor: 'customer', title: 'ลูกค้า' },
              {
                accessor: 'billing',
                title: 'บิล',
                render: (r) => (
                  <StatusBadge color={r.billing === 'VAT' ? 'blue' : 'gray'}>
                    {r.billing}
                  </StatusBadge>
                ),
              },
              {
                accessor: 'total',
                title: 'ยอดรวม',
                textAlign: 'right',
                render: (r) => formatAmount(r.total),
              },
              { accessor: 'date', title: 'วันที่' },
              {
                accessor: 'status',
                title: 'สถานะ',
                render: (r) =>
                  r.creditNote ? (
                    <StatusBadge color="brand">มีใบลดหนี้ {r.creditNote}</StatusBadge>
                  ) : (
                    <StatusBadge color="green">ออกแล้ว</StatusBadge>
                  ),
              },
              {
                accessor: 'actions',
                title: '',
                textAlign: 'right',
                render: (r) => (
                  <Button size="compact-xs" variant="default" onClick={() => setPreview(r.no)}>
                    ดูตัวอย่าง
                  </Button>
                ),
              },
            ]}
          />
          <Text size="xs" c="dimmed">
            รูปแบบเลขที่ INV-ปปดด-ลำดับ และรอบการรันเลข รอยืนยัน (Q20)
          </Text>
        </Stack>
      </Paper>

      <ConfirmModal
        opened={issueOpened}
        onClose={issue.close}
        title="ออกเอกสาร"
        confirmLabel={`ออกเอกสาร ${checked.length} ฉบับ`}
        doneMessage={`ออกเอกสาร ${checked.length} ฉบับแล้ว`}
        confirmDisabled={checked.length === 0}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label="ประเภทเอกสาร"
            data={['ใบกำกับภาษีเต็มรูป', 'ใบกำกับภาษีอย่างย่อ', 'ใบเสร็จรับเงิน']}
            defaultValue="ใบกำกับภาษีเต็มรูป"
            description="เต็มรูป/อย่างย่อ รอยืนยัน (Q17)"
          />
          <TextInput label="วันที่เอกสาร" defaultValue="13/11/2569" />
        </SimpleGrid>
        <Text size="sm" fw={500}>
          Order ที่พร้อมออกเอกสาร
        </Text>
        <Checkbox.Group value={checked} onChange={setChecked}>
          <Stack gap="xs">
            {READY.map((o) => (
              <Paper key={o.order} withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <Group gap="sm">
                    <Checkbox value={o.order} aria-label={o.order} />
                    <div>
                      <Text fw={600} size="sm">
                        {o.order}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {o.customer} · VAT
                      </Text>
                    </div>
                  </Group>
                  <Text fw={700}>{formatBaht(o.total, { decimals: true })}</Text>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Checkbox.Group>
        <Paper withBorder p="sm" radius="md">
          <KeyValue label="เลขที่ถัดไป">
            <Text span ff="monospace" size="sm">
              INV-2611-0043{checked.length > 1 && `, 00${43 + checked.length - 1}`}
            </Text>
          </KeyValue>
        </Paper>
      </ConfirmModal>

      <InvoicePreviewModal
        opened={preview !== null}
        onClose={() => setPreview(null)}
        docNo={preview ?? ''}
        onCancelDocument={credit.open}
      />
      <CreditNoteModal opened={creditOpened} onClose={credit.close} />
    </Stack>
  );
}
