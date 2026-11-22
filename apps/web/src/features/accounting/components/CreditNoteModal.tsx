import { NumberInput, Paper, Radio, Select, Stack, Table, Text } from '@mantine/core';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { formatBaht } from '@/lib/format';

const LINES = [
  { name: 'เต้าหู้ แพ็ค 10', qty: 5, price: 190 },
  { name: 'น้ำจิ้ม 400g', qty: 2, price: 125 },
  { name: 'ค่าขนส่ง', qty: 1, price: 50 },
];

/** Modal · สร้างใบลดหนี้ (credit notes page + invoice preview) */
export function CreditNoteModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [reason, setReason] = useState('cancel');
  const [qty, setQty] = useState(() => LINES.map((l) => l.qty));
  const original = LINES.reduce((s, l) => s + l.qty * l.price, 0);
  const credit = LINES.reduce((s, l, i) => s + (qty[i] ?? 0) * l.price, 0);

  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="สร้างใบลดหนี้"
      confirmLabel="ออกใบลดหนี้"
      doneMessage="ออกใบลดหนี้ CN-2611-0004 แล้ว"
    >
      <Select
        label="อ้างอิงบิลเดิม"
        withAsterisk
        data={['INV-2611-0040 · ร้านเจ๊หมวย · ฿1,250.00', 'INV-2611-0042 · บจก. สยามฟู้ด · ฿2,850.00']}
        defaultValue="INV-2611-0040 · ร้านเจ๊หมวย · ฿1,250.00"
      />
      <Radio.Group
        label="เหตุผล"
        value={reason}
        onChange={(v) => {
          setReason(v);
          if (v === 'cancel') setQty(LINES.map((l) => l.qty));
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
          {LINES.map((l, i) => (
            <Table.Tr key={l.name}>
              <Table.Td>{l.name}</Table.Td>
              <Table.Td ta="right">{l.qty}</Table.Td>
              <Table.Td w={120}>
                <NumberInput
                  size="xs"
                  min={0}
                  max={l.qty}
                  value={qty[i]}
                  disabled={reason === 'cancel'}
                  onChange={(v) => setQty(qty.map((q, j) => (j === i ? Number(v) || 0 : q)))}
                />
              </Table.Td>
              <Table.Td ta="right">
                {formatBaht((qty[i] ?? 0) * l.price, { decimals: true })}
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
              CN-2611-0004
            </Text>
          </KeyValue>
        </Stack>
      </Paper>
    </ConfirmModal>
  );
}
