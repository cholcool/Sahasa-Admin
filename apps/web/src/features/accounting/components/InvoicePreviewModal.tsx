import { Box, Button, Grid, Group, Select, Stack, Table, Text, Title } from '@mantine/core';
import { PrintPaper } from '@/components/ui/PrintPaper';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { splitVat, thaiBahtText } from '@/features/accounting/vat';
import { useMockDb } from '@/features/mock/store';
import type { MockDocument } from '@/features/mock/types';
import { formatThaiDate } from '@/lib/dayjs';
import { formatAmount } from '@/lib/format';

interface InvoicePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  doc: MockDocument | null;
  onCancelDocument: () => void;
}

/**
 * Modal · ตัวอย่างใบกำกับ 9×11 (SRS 30, 31, 33).
 * Thai documents are printed from HTML + CSS @page (see CLAUDE.md), never generated with pdf-lib.
 */
export function InvoicePreviewModal({
  opened,
  onClose,
  doc,
  onCancelDocument,
}: InvoicePreviewModalProps) {
  const db = useMockDb();
  const docNo = doc?.no ?? '';
  const order = db.orders.find((o) => o.orderNumber === doc?.orderNumber);
  const customer = db.customers.find((c) => c.id === order?.customerId);
  const lines = [
    ...(order?.lines ?? []).map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
    ...(order && order.shippingFee > 0
      ? [{ name: 'ค่าขนส่ง', qty: 1, price: order.shippingFee }]
      : []),
  ];
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const vatDoc = doc?.billing === 'VAT';
  const { base, vat } = vatDoc ? splitVat(total) : { base: total, vat: 0 };
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title={`ตัวอย่าง${doc?.type ?? 'เอกสาร'} · ${docNo}`}
      confirmLabel="พิมพ์"
      doneMessage="ส่งไปเครื่องพิมพ์ dot matrix แล้ว"
      onConfirm={() => window.print()}
      size="xl"
    >
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <PrintPaper mono>
            <Stack gap={6}>
              <Group justify="space-between">
                <Text fw={700} size="sm">
                  บริษัท สหัสา ฟู้ด จำกัด (สำนักงานใหญ่)
                </Text>
                <Text fw={700} size="sm">
                  ต้นฉบับ
                </Text>
              </Group>
              <Text size="xs">
                99 ถ.คลองแงะ ต.พังลา อ.สะเดา จ.สงขลา 90170 · เลขผู้เสียภาษี 0905561000123
              </Text>
              <Title order={5} ta="center" my={4}>
                {vatDoc ? 'ใบกำกับภาษี / ใบเสร็จรับเงิน' : 'ใบเสร็จรับเงิน'}
              </Title>
              <Group justify="space-between" align="flex-start">
                <Text size="xs">
                  ลูกค้า: {doc?.customerName}
                  <br />
                  เลขผู้เสียภาษี: {customer?.taxId ?? '-'}
                  <br />
                  ที่อยู่: {order?.address}
                </Text>
                <Text size="xs">
                  เลขที่: {docNo}
                  <br />
                  วันที่: {doc ? formatThaiDate(doc.issuedAt, 'DD/MM/BBBB') : ''}
                  <br />
                  อ้างอิง: {doc?.orderNumber}
                </Text>
              </Group>
              <Table withTableBorder withColumnBorders fz="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>รายการ</Table.Th>
                    <Table.Th ta="right">จำนวน</Table.Th>
                    <Table.Th ta="right">ราคา/หน่วย</Table.Th>
                    <Table.Th ta="right">จำนวนเงิน</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {lines.map((l) => (
                    <Table.Tr key={l.name}>
                      <Table.Td>{l.name}</Table.Td>
                      <Table.Td ta="right">{l.qty}</Table.Td>
                      <Table.Td ta="right">{formatAmount(l.price)}</Table.Td>
                      <Table.Td ta="right">{formatAmount(l.qty * l.price)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Box ml="auto" w={{ base: '100%', sm: 260 }}>
                <KeyValue label="มูลค่าสินค้า">{formatAmount(base)}</KeyValue>
                {vatDoc && <KeyValue label="ภาษีมูลค่าเพิ่ม 7%">{formatAmount(vat)}</KeyValue>}
                <KeyValue label="รวมทั้งสิ้น">
                  <b>{formatAmount(total)}</b>
                </KeyValue>
              </Box>
              <Text size="xs">({thaiBahtText(total)})</Text>
              <Group justify="space-between" mt="md">
                <Text size="xs">ผู้รับเงิน ..................</Text>
                <Text size="xs">ผู้รับสินค้า ..................</Text>
              </Group>
            </Stack>
          </PrintPaper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Select
              label="กระดาษ"
              data={['9×11 นิ้ว (Dot matrix)', 'A4']}
              defaultValue="9×11 นิ้ว (Dot matrix)"
            />
            <Select
              label="ชุดที่พิมพ์"
              data={['ต้นฉบับ + สำเนา', 'ต้นฉบับ', 'สำเนา']}
              defaultValue="ต้นฉบับ + สำเนา"
            />
            <Text size="xs" c="dimmed">
              ราคารวม VAT หรือบวก VAT เพิ่ม รอยืนยัน (Q18)
            </Text>
            <Button
              color="brand"
              variant="light"
              onClick={() => {
                onClose();
                onCancelDocument();
              }}
            >
              ยกเลิกเอกสารนี้
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>
    </ConfirmModal>
  );
}
