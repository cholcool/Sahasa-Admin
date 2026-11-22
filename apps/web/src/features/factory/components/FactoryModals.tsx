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
import { PrintPaper } from '@/components/ui/PrintPaper';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';

interface ModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Modal · รายละเอียดการแก้ไขหลังรับ (used by factory dashboard and queue) */
export function EditedAfterAcceptModal({ opened, onClose }: ModalProps) {
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="Order ถูกแก้ไขหลังโรงงานรับ"
      confirmLabel="รับทราบ"
      doneMessage="รับทราบการแก้ไขแล้ว"
    >
      <Text size="sm">
        <b>ORD-000128</b>{' '}
        <Text span c="dimmed">
          · Facebook · คุณนิด · Inter Express
        </Text>
      </Text>
      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ฟิลด์</Table.Th>
            <Table.Th>เดิม</Table.Th>
            <Table.Th>ใหม่</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>เต้าหู้ แพ็ค 10</Table.Td>
            <Table.Td>4</Table.Td>
            <Table.Td fw={700}>5</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>ยอดรวม</Table.Td>
            <Table.Td>฿760</Table.Td>
            <Table.Td fw={700}>฿950</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      <Text size="xs" c="dimmed">
        แก้ไขโดย Sales01 · 13 พ.ย. 10:42 · ภายในเวลาที่อนุญาต
      </Text>
      <Alert color="orange" variant="light">
        ยอดผลิตรอบนี้ปรับเพิ่ม +1 แพ็คแล้ว · กรุณาพิมพ์ใบจัดสินค้าใหม่
      </Alert>
    </ConfirmModal>
  );
}

const DOC_TYPES = ['ใบจัดสินค้า', 'ใบปะหน้า', 'ใบสรุปยอดผลิต'];

/** Modal · ตัวอย่างก่อนพิมพ์ (production summary and print pages) */
export function PrintPreviewModal({
  opened,
  onClose,
  orderCount,
  defaultDoc = 'ใบจัดสินค้า',
}: ModalProps & { orderCount: number; defaultDoc?: string }) {
  const [doc, setDoc] = useState<string | null>(defaultDoc);
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="ตัวอย่างก่อนพิมพ์"
      confirmLabel={`สั่งพิมพ์ ${orderCount} รายการ`}
      doneMessage="ส่งไปเครื่องพิมพ์แล้ว"
      onConfirm={() => window.print()}
      size="xl"
    >
      <Grid>
        <Grid.Col span={{ base: 12, sm: 7 }}>
          {/* Paper preview stays white in dark mode, like printed output */}
          <PrintPaper>
            <Stack gap="xs">
              <Title order={4} ta="center">
                {doc}
              </Title>
              <Text size="sm">
                รอบ 13 พ.ย. 2569 · 12:00{' '}
                <Text span ff="monospace" fw={700} style={{ float: 'right' }}>
                  ORD-000141
                </Text>
              </Text>
              <Text size="sm">
                ลูกค้า: ร้านเจ๊หมวย · 081-234-5678
                <br />
                ขนส่ง: Nim Express (กทม.)
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
                  <Table.Tr>
                    <Table.Td>เต้าหู้คลองแงะ แพ็ค 10 ชิ้น</Table.Td>
                    <Table.Td ta="center">5</Table.Td>
                    <Table.Td ta="center">☐</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>น้ำจิ้ม 400g</Table.Td>
                    <Table.Td ta="center">2</Table.Td>
                    <Table.Td ta="center">☐</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
              <Text size="sm" mt="md">
                ผู้จัด ..................{' '}
                <span style={{ float: 'right' }}>ผู้ตรวจ ..................</span>
              </Text>
              <Text size="xs" c="dimmed">
                หน้า 2 จาก {orderCount}
              </Text>
            </Stack>
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
