import { Alert, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreditNoteModal } from '@/features/accounting/components/CreditNoteModal';
import { splitVat } from '@/features/accounting/vat';
import { cancelledNeedingCreditNote } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { formatThaiDate } from '@/lib/dayjs';
import { formatAmount } from '@/lib/format';

/** 05-03 Credit notes (SRS 32) */
export const Route = createFileRoute('/_app/accounting/credit-notes')({
  component: CreditNotesPage,
});

function CreditNotesPage() {
  const db = useMockDb();
  const [modal, setModal] = useState<{ invoiceNo?: string } | null>(null);
  const pending = cancelledNeedingCreditNote(db);
  const notes = [...db.creditNotes].toSorted((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <Stack>
      <PageHeader
        title="ใบลดหนี้"
        description="ออกเมื่อยกเลิกหรือคืนสินค้าหลังออกบิล โดยอ้างอิงเลขที่บิลเดิม"
        actions={<Button onClick={() => setModal({})}>สร้างใบลดหนี้</Button>}
      />
      {pending.map(({ doc, order }) => (
        <Alert key={doc.no} color="gold" variant="light">
          <Group justify="space-between">
            <Text size="sm">
              {doc.orderNumber} ถูกยกเลิกหลังออกบิล {doc.no}
              {order?.cancelReason && ` (${order.cancelReason})`} · ต้องออกใบลดหนี้
            </Text>
            <Button size="xs" variant="default" onClick={() => setModal({ invoiceNo: doc.no })}>
              สร้างจากรายการนี้
            </Button>
          </Group>
        </Alert>
      ))}
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          minHeight={160}
          idAccessor="no"
          records={notes}
          noRecordsText="ยังไม่มีใบลดหนี้"
          columns={[
            {
              accessor: 'no',
              title: 'เลขที่',
              render: (r) => (
                <Text ff="monospace" fw={700} size="sm">
                  {r.no}
                </Text>
              ),
            },
            {
              accessor: 'invoiceNo',
              title: 'อ้างอิงบิล',
              render: (r) => (
                <Text ff="monospace" size="sm">
                  {r.invoiceNo}
                </Text>
              ),
            },
            { accessor: 'orderNumber', title: 'Order' },
            { accessor: 'customerName', title: 'ลูกค้า' },
            { accessor: 'reason', title: 'เหตุผล' },
            {
              accessor: 'base',
              title: 'มูลค่าลดหนี้',
              textAlign: 'right',
              render: (r) => formatAmount(splitVat(r.total).base),
            },
            {
              accessor: 'vat',
              title: 'VAT',
              textAlign: 'right',
              render: (r) => formatAmount(splitVat(r.total).vat),
            },
            {
              accessor: 'issuedAt',
              title: 'วันที่',
              render: (r) => formatThaiDate(r.issuedAt, 'D MMM'),
            },
            {
              accessor: 'voided',
              title: 'สถานะ',
              render: (r) =>
                r.voided ? (
                  <StatusBadge>ยกเลิกเอกสาร</StatusBadge>
                ) : (
                  <StatusBadge color="green">ออกแล้ว</StatusBadge>
                ),
            },
          ]}
        />
      </Paper>
      {modal && (
        <CreditNoteModal opened onClose={() => setModal(null)} initialInvoiceNo={modal.invoiceNo} />
      )}
    </Stack>
  );
}
