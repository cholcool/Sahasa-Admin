import {
  Alert,
  Checkbox,
  Grid,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { PrintPaper } from '@/components/ui/PrintPaper';
import { carrierName, roundText } from '@/features/mock/selectors';
import type { MockOrder } from '@/features/mock/types';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { formatThaiDate } from '@/lib/dayjs';

interface ModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Modal · รายละเอียดการแก้ไขหลังรับ (used by factory dashboard and queue) */
export function EditedAfterAcceptModal({
  opened,
  onClose,
  order,
}: ModalProps & { order: MockOrder | null }) {
  const edits = order?.history.filter((h) => h.type === 'edited') ?? [];
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="Order ถูกแก้ไขหลังโรงงานรับ"
      confirmLabel="รับทราบ"
      doneMessage="รับทราบการแก้ไขแล้ว"
    >
      {order && (
        <>
          <Text size="sm">
            <b>{order.orderNumber}</b>{' '}
            <Text span c="dimmed">
              · {CHANNEL_LABEL_TH[order.channel]} · {order.customerName} ·{' '}
              {carrierName(order.carrierId)}
            </Text>
          </Text>
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>เวลา</Table.Th>
                <Table.Th>การแก้ไข</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {edits.map((e) => (
                <Table.Tr key={e.at + e.text}>
                  <Table.Td>{formatThaiDate(e.at, 'D MMM HH:mm')}</Table.Td>
                  <Table.Td>{e.text}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Alert color="orange" variant="light">
            ยอดผลิตรอบ {roundText(order.roundDate)} ปรับตามแล้ว · กรุณาพิมพ์ใบจัดสินค้าใหม่
          </Alert>
        </>
      )}
    </ConfirmModal>
  );
}

const DOC_TYPES = ['ใบจัดสินค้า', 'ใบปะหน้า', 'ใบสรุปยอดผลิต'];

/** Modal · ตัวอย่างก่อนพิมพ์ (production summary and print pages) */
export function PrintPreviewModal({
  opened,
  onClose,
  orders,
  defaultDoc = 'ใบจัดสินค้า',
  onPrinted,
}: ModalProps & {
  orders: MockOrder[];
  defaultDoc?: string;
  onPrinted?: (doc: string) => void;
}) {
  const [doc, setDoc] = useState<string | null>(defaultDoc);
  const sample = orders[0];
  const orderCount = orders.length;
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="ตัวอย่างก่อนพิมพ์"
      confirmLabel={`สั่งพิมพ์ ${orderCount} รายการ`}
      confirmDisabled={orderCount === 0}
      doneMessage="ส่งไปเครื่องพิมพ์แล้ว"
      onConfirm={() => {
        onPrinted?.(doc ?? defaultDoc);
        window.print();
      }}
      size="xl"
    >
      <Grid>
        <Grid.Col span={{ base: 12, sm: 7 }}>
          {/* Paper preview stays white in dark mode, like printed output */}
          <PrintPaper>
            {sample ? (
              <Stack gap="xs">
                <Title order={4} ta="center">
                  {doc}
                </Title>
                <Text size="sm">
                  รอบ {roundText(sample.roundDate)}{' '}
                  <Text span ff="monospace" fw={700} style={{ float: 'right' }}>
                    {sample.orderNumber}
                  </Text>
                </Text>
                <Text size="sm">
                  ลูกค้า: {sample.customerName} · {sample.phone}
                  <br />
                  ขนส่ง: {carrierName(sample.carrierId, true)}
                </Text>
                <Table withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>สินค้า</Table.Th>
                      <Table.Th ta="center">จำนวน</Table.Th>
                      <Table.Th ta="center">จัดแล้ว</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sample.lines.map((l) => (
                      <Table.Tr key={l.productId}>
                        <Table.Td>{l.name}</Table.Td>
                        <Table.Td ta="center">{l.qty}</Table.Td>
                        <Table.Td ta="center">☐</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                <Text size="sm" mt="md">
                  ผู้จัด ..................{' '}
                  <span style={{ float: 'right' }}>ผู้ตรวจ ..................</span>
                </Text>
                <Text size="xs" c="dimmed">
                  หน้า 1 จาก {orderCount}
                </Text>
              </Stack>
            ) : (
              <Text c="dimmed">ยังไม่ได้เลือก Order</Text>
            )}
          </PrintPaper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Stack>
            <Select label="เอกสาร" data={DOC_TYPES} value={doc} onChange={setDoc} />
            <Select label="ขนาดกระดาษ" data={['A4', 'A5', 'Label 100×150 มม.']} defaultValue="A5" />
            <NumberInput label="จำนวนสำเนา" defaultValue={1} min={1} />
            <Checkbox label="รวมหลาย Order ต่อหน้า" />
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4}>
                <KeyValue label="Order">{orderCount} รายการ</KeyValue>
                <KeyValue label="จำนวนหน้า">{orderCount}</KeyValue>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </ConfirmModal>
  );
}
