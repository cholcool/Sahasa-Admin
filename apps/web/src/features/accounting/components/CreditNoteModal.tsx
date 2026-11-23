import { NumberInput, Paper, Radio, Select, Stack, Table, Text } from '@mantine/core';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { createCreditNote, nextDocumentNo, nowThai } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import { formatBaht } from '@/lib/format';

const REASONS = {
  cancel: 'ยกเลิก Order',
  return: 'คืนสินค้าบางส่วน',
  discount: 'ลดราคา',
} as const;

type Reason = keyof typeof REASONS;

/** Modal · สร้างใบลดหนี้ (credit notes page + invoice preview) */
export function CreditNoteModal({
  opened,
  onClose,
  initialInvoiceNo,
}: {
  opened: boolean;
  onClose: () => void;
  initialInvoiceNo?: string;
}) {
  const db = useMockDb();
  const credited = new Set(db.creditNotes.filter((c) => !c.voided).map((c) => c.invoiceNo));
  const invoices = db.documents
    .filter((d) => !credited.has(d.no))
    .slice()
    .toReversed();
  const [invoiceNo, setInvoiceNo] = useState<string | null>(
    initialInvoiceNo ?? invoices[0]?.no ?? null,
  );
  const doc = db.documents.find((d) => d.no === invoiceNo);
  const order = db.orders.find((o) => o.orderNumber === doc?.orderNumber);
  const lines = [
    ...(order?.lines ?? []).map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
    ...(order && order.shippingFee > 0
      ? [{ name: 'ค่าขนส่ง', qty: 1, price: order.shippingFee }]
      : []),
  ];
  const [reason, setReason] = useState<Reason>(order?.status === 'cancelled' ? 'cancel' : 'return');
  const [qty, setQty] = useState<number[] | null>(null);
  const quantities =
    reason === 'cancel' || !qty ? lines.map((l) => (reason === 'cancel' ? l.qty : 0)) : qty;
  const original = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const credit = lines.reduce((s, l, i) => s + (quantities[i] ?? 0) * l.price, 0);

  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="สร้างใบลดหนี้"
      confirmLabel="ออกใบลดหนี้"
      confirmDisabled={!doc || credit <= 0}
      doneMessage={`ออกใบลดหนี้ ${nextDocumentNo(db, 'CN', nowThai())} แล้ว`}
      onConfirm={() => doc && createCreditNote(doc.no, REASONS[reason], credit)}
    >
      <Select
        label="อ้างอิงบิลเดิม"
        withAsterisk
        searchable
        data={invoices.map((d) => ({
          value: d.no,
          label: `${d.no} · ${d.customerName} · ${formatBaht(d.total, { decimals: true })}`,
        }))}
        value={invoiceNo}
        onChange={(v) => {
          setInvoiceNo(v);
          setQty(null);
        }}
        nothingFoundMessage="ไม่พบเอกสาร"
      />
      <Radio.Group
        label="เหตุผล"
        value={reason}
        onChange={(v) => {
          const next = v === 'cancel' || v === 'discount' ? v : 'return';
          setReason(next);
          setQty(null);
        }}
      >
        <Stack gap="xs" mt="xs">
          <Radio value="cancel" label="ยกเลิก Order ทั้งหมด" />
          <Radio value="return" label="คืนสินค้าบางส่วน" />
          <Radio value="discount" label="ลดราคา / ส่วนลดภายหลัง" />
        </Stack>
      </Radio.Group>
      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>สินค้า</Table.Th>
            <Table.Th ta="right">จำนวนเดิม</Table.Th>
            <Table.Th ta="right">จำนวนที่ลดหนี้</Table.Th>
            <Table.Th ta="right">มูลค่า</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((l, i) => (
            <Table.Tr key={l.name}>
              <Table.Td>{l.name}</Table.Td>
              <Table.Td ta="right">{l.qty}</Table.Td>
              <Table.Td w={120}>
                <NumberInput
                  size="xs"
                  min={0}
                  max={l.qty}
                  value={quantities[i]}
                  disabled={reason === 'cancel'}
                  onChange={(v) => setQty(quantities.map((q, j) => (j === i ? Number(v) || 0 : q)))}
                />
              </Table.Td>
              <Table.Td ta="right">
                {formatBaht((quantities[i] ?? 0) * l.price, { decimals: true })}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Paper withBorder p="sm" radius="md">
        <Stack gap={4}>
          <KeyValue label="มูลค่าตามบิลเดิม">{formatBaht(original, { decimals: true })}</KeyValue>
          <KeyValue label="มูลค่าที่ถูกต้อง">
            {formatBaht(original - credit, { decimals: true })}
          </KeyValue>
          <KeyValue label="ผลต่าง (ลดหนี้)">
            <b>{formatBaht(credit, { decimals: true })}</b>
          </KeyValue>
          <KeyValue label="เลขที่ถัดไป">
            <Text span ff="monospace" size="sm">
              {nextDocumentNo(db, 'CN', nowThai())}
            </Text>
          </KeyValue>
        </Stack>
      </Paper>
    </ConfirmModal>
  );
}
