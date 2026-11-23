import {
  Button,
  Checkbox,
  Group,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
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
import { issueDocuments, nextDocumentNo, nowThai } from '@/features/mock/actions';
import { ordersAwaitingDocument } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import type { DocumentKind, MockDocument } from '@/features/mock/types';
import { formatThaiDate } from '@/lib/dayjs';
import { formatAmount, formatBaht } from '@/lib/format';

/** 05-02 Tax invoices and receipts (SRS 30, 31, 33) */
export const Route = createFileRoute('/_app/accounting/documents')({
  component: AccountingDocumentsPage,
});

const DOC_TYPES: { value: string; kind: DocumentKind }[] = [
  { value: 'ใบกำกับภาษีเต็มรูป', kind: 'inv' },
  { value: 'ใบกำกับภาษีอย่างย่อ', kind: 'inv' },
  { value: 'ใบเสร็จรับเงิน', kind: 'rc' },
];

const PAGE_SIZE = 25;

function AccountingDocumentsPage() {
  const db = useMockDb();
  const [tab, setTab] = useState<string | null>('all');
  const [q, setQ] = useState('');
  const [billing, setBilling] = useState<string | null>('all');
  const months = [...new Set(db.documents.map((d) => d.issuedAt.slice(0, 7)))]
    .toSorted()
    .toReversed();
  const [month, setMonth] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<MockDocument | null>(null);
  const [issueOpened, setIssueOpened] = useState(false);
  const [credit, setCredit] = useState<{ invoiceNo?: string } | null>(null);

  const cn = new Map(db.creditNotes.filter((c) => !c.voided).map((c) => [c.invoiceNo, c.no]));
  const query = q.trim().toLowerCase();
  const filtered = db.documents
    .filter(
      (d) =>
        (!month || d.issuedAt.startsWith(month)) &&
        (billing === 'all' || d.billing === billing) &&
        (!query ||
          d.no.toLowerCase().includes(query) ||
          d.orderNumber.toLowerCase().includes(query) ||
          d.customerName.toLowerCase().includes(query)),
    )
    .toSorted((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const rows = filtered.filter((d) => tab === 'all' || d.kind === tab);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const reset = () => setPage(1);

  return (
    <Stack>
      <PageHeader
        title="เอกสารบัญชี"
        description="ใบกำกับภาษีและใบเสร็จ ออกตามประเภทการออกบิลของลูกค้า · รันเลขอัตโนมัติแยกตามประเภท"
        actions={<Button onClick={() => setIssueOpened(true)}>ออกเอกสาร</Button>}
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Tabs
            value={tab}
            onChange={(v) => {
              setTab(v);
              reset();
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="all">ทั้งหมด ({filtered.length})</Tabs.Tab>
              <Tabs.Tab value="inv">
                ใบกำกับภาษี ({filtered.filter((d) => d.kind === 'inv').length})
              </Tabs.Tab>
              <Tabs.Tab value="rc">
                ใบเสร็จรับเงิน ({filtered.filter((d) => d.kind === 'rc').length})
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={240}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเลขที่เอกสาร, Order, ลูกค้า"
              value={q}
              onChange={(e) => {
                setQ(e.currentTarget.value);
                reset();
              }}
            />
            <Select
              aria-label="เดือน"
              placeholder="ทุกเดือน"
              clearable
              data={months.map((m) => ({ value: m, label: formatThaiDate(`${m}-01`, 'MMM BBBB') }))}
              value={month}
              onChange={(v) => {
                setMonth(v);
                reset();
              }}
            />
            <Select
              aria-label="ประเภทบิล"
              data={[
                { value: 'all', label: 'VAT และ NOVAT' },
                { value: 'VAT', label: 'VAT' },
                { value: 'NOVAT', label: 'NOVAT' },
              ]}
              value={billing}
              onChange={(v) => {
                setBilling(v ?? 'all');
                reset();
              }}
              allowDeselect={false}
            />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            minHeight={200}
            idAccessor="no"
            records={pageRows}
            totalRecords={rows.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
            noRecordsText="ไม่พบเอกสาร"
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
              { accessor: 'orderNumber', title: 'อ้างอิง Order' },
              { accessor: 'customerName', title: 'ลูกค้า' },
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
              {
                accessor: 'issuedAt',
                title: 'วันที่',
                render: (r) => formatThaiDate(r.issuedAt, 'D MMM'),
              },
              {
                accessor: 'status',
                title: 'สถานะ',
                render: (r) =>
                  cn.has(r.no) ? (
                    <StatusBadge color="brand">มีใบลดหนี้ {cn.get(r.no)}</StatusBadge>
                  ) : (
                    <StatusBadge color="green">ออกแล้ว</StatusBadge>
                  ),
              },
              {
                accessor: 'actions',
                title: '',
                textAlign: 'right',
                render: (r) => (
                  <Button size="compact-xs" variant="default" onClick={() => setPreview(r)}>
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

      {issueOpened && <IssueModal onClose={() => setIssueOpened(false)} />}
      <InvoicePreviewModal
        opened={preview !== null}
        onClose={() => setPreview(null)}
        doc={preview}
        onCancelDocument={() => setCredit({ invoiceNo: preview?.no })}
      />
      {credit && (
        <CreditNoteModal
          opened
          onClose={() => setCredit(null)}
          initialInvoiceNo={credit.invoiceNo}
        />
      )}
    </Stack>
  );
}

function IssueModal({ onClose }: { onClose: () => void }) {
  const db = useMockDb();
  const [type, setType] = useState<string>('ใบกำกับภาษีเต็มรูป');
  const kind = DOC_TYPES.find((t) => t.value === type)?.kind ?? 'inv';
  // VAT customers get tax invoices, NOVAT customers get receipts
  const ready = ordersAwaitingDocument(db).filter((o) =>
    kind === 'inv' ? o.billing === 'VAT' : o.billing === 'NOVAT',
  );
  const [checked, setChecked] = useState<string[]>([]);
  const first = nextDocumentNo(db, kind === 'inv' ? 'INV' : 'RC', nowThai());

  return (
    <ConfirmModal
      opened
      onClose={onClose}
      title="ออกเอกสาร"
      confirmLabel={`ออกเอกสาร ${checked.length} ฉบับ`}
      doneMessage={`ออกเอกสาร ${checked.length} ฉบับแล้ว`}
      confirmDisabled={checked.length === 0}
      onConfirm={() =>
        issueDocuments(
          checked,
          kind,
          type === 'ใบกำกับภาษีเต็มรูป'
            ? 'ใบกำกับเต็มรูป'
            : type === 'ใบกำกับภาษีอย่างย่อ'
              ? 'ใบกำกับอย่างย่อ'
              : 'ใบเสร็จรับเงิน',
        )
      }
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Select
          label="ประเภทเอกสาร"
          data={DOC_TYPES.map((t) => t.value)}
          value={type}
          onChange={(v) => {
            if (v) setType(v);
            setChecked([]);
          }}
          allowDeselect={false}
          description="เต็มรูป/อย่างย่อ รอยืนยัน (Q17)"
        />
        <TextInput label="วันที่เอกสาร" value={formatThaiDate(nowThai(), 'DD/MM/BBBB')} readOnly />
      </SimpleGrid>
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Order ที่พร้อมออกเอกสาร ({ready.length})
        </Text>
        <Button
          size="compact-xs"
          variant="subtle"
          disabled={ready.length === 0}
          onClick={() => setChecked(ready.map((o) => o.orderNumber))}
        >
          เลือกทั้งหมด
        </Button>
      </Group>
      {ready.length === 0 && (
        <Text size="sm" c="dimmed">
          ไม่มี Order ที่รอออกเอกสารประเภทนี้
        </Text>
      )}
      <ScrollArea.Autosize mah={320}>
        <Checkbox.Group value={checked} onChange={setChecked}>
          <Stack gap="xs">
            {ready.map((o) => (
              <Paper key={o.orderNumber} withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <Group gap="sm">
                    <Checkbox value={o.orderNumber} aria-label={o.orderNumber} />
                    <div>
                      <Text fw={600} size="sm">
                        {o.orderNumber}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {o.customerName} · {o.billing}
                      </Text>
                    </div>
                  </Group>
                  <Text fw={700}>{formatBaht(o.total, { decimals: true })}</Text>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Checkbox.Group>
      </ScrollArea.Autosize>
      <Paper withBorder p="sm" radius="md">
        <KeyValue label="เลขที่ถัดไป">
          <Text span ff="monospace" size="sm">
            {first}
            {checked.length > 1 && ` … (${checked.length} ฉบับ)`}
          </Text>
        </KeyValue>
      </Paper>
    </ConfirmModal>
  );
}
