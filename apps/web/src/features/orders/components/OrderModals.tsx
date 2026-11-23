import {
  Alert,
  Group,
  NumberInput,
  Paper,
  Radio,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SlipThumbnails } from '@/features/orders/components/SlipThumbnails';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { CANCEL_REASONS, CHANNEL_LABEL_TH } from '@/features/orders/labels';
import type { MockOrder, PaymentMethod } from '@/features/mock/types';
import { nowThai } from '@/features/mock/actions';
import { formatThaiDate } from '@/lib/dayjs';
import { formatBaht } from '@/lib/format';

interface ModalProps {
  opened: boolean;
  onClose: () => void;
  order: MockOrder;
}

/** Modal · ยกเลิก Order */
export function CancelOrderModal({
  opened,
  onClose,
  order,
  onConfirm,
}: ModalProps & { onConfirm: (reason: string, note: string) => void }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0] ?? '');
  const [note, setNote] = useState('');
  const accepted = order.status === 'factory_accepted';
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="ยกเลิก Order"
      confirmLabel="ยืนยันการยกเลิก"
      confirmColor="brand"
      doneMessage={`ยกเลิก ${order.orderNumber} แล้ว${accepted ? ' · แจ้งเตือนโรงงาน' : ''}`}
      onConfirm={() => onConfirm(reason, note)}
    >
      {accepted && (
        <Alert color="brand" variant="light">
          Order นี้โรงงานรับแล้ว ระบบจะแจ้งเตือนโรงงานทันทีเมื่อยกเลิก
        </Alert>
      )}
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between">
          <div>
            <Text fw={600}>{order.orderNumber}</Text>
            <Text size="xs" c="dimmed">
              {order.customerName} · {CHANNEL_LABEL_TH[order.channel]} · {formatBaht(order.total)}
            </Text>
          </div>
          <OrderStatusBadge status={order.status} />
        </Group>
      </Paper>
      <Radio.Group label="เหตุผลการยกเลิก" withAsterisk value={reason} onChange={setReason}>
        <Stack gap="xs" mt="xs">
          {CANCEL_REASONS.map((r) => (
            <Radio key={r} value={r} label={r} />
          ))}
        </Stack>
      </Radio.Group>
      <Textarea
        label="หมายเหตุเพิ่มเติม"
        placeholder="ระบุรายละเอียด (ถ้ามี)"
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
      />
      <Text size="xs" c="dimmed">
        ระบบจะไม่ลบข้อมูล Order และจะออกใบลดหนี้หากออกบิลไปแล้ว
      </Text>
    </ConfirmModal>
  );
}

/** Modal · ยืนยันการรับเงิน */
const METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'โอน', value: 'transfer' },
  { label: 'เงินสด', value: 'cash' },
  { label: 'ชำระผ่าน Platform', value: 'platform' },
];

export function ConfirmPaymentModal({
  opened,
  onClose,
  order,
  onConfirm,
}: ModalProps & { onConfirm: (method: PaymentMethod, amount: number) => void }) {
  const amountDue = order.total;
  const orderNumber = order.orderNumber;
  const [method, setMethod] = useState<string>(
    order.paymentMethod === 'cash' ? 'cash' : 'transfer',
  );
  const [received, setReceived] = useState<number | string>(amountDue);
  const diff = Number(received) - amountDue;
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title={`ยืนยันการรับเงิน · ${orderNumber}`}
      confirmLabel="ยืนยันรับเงิน"
      confirmColor="gold"
      doneMessage="ยืนยันรับเงินแล้ว"
      onConfirm={() =>
        onConfirm(
          METHODS.find((m) => m.value === method)?.value ?? 'transfer',
          Number(received) || 0,
        )
      }
    >
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between">
          <Text c="dimmed">ยอดที่ต้องชำระ</Text>
          <Text fw={700}>{formatBaht(amountDue)}</Text>
        </Group>
      </Paper>
      <div>
        <Text size="sm" fw={500} mb={4}>
          วิธีชำระ
        </Text>
        <SegmentedControl data={METHODS} value={method} onChange={setMethod} />
      </div>
      <Select
        label="บัญชีที่รับเงิน"
        data={['กสิกร xxx-x-x1234 (บัญชี NOVAT)', 'ไทยพาณิชย์ xxx-x-x5678 (บัญชี VAT)']}
        defaultValue="กสิกร xxx-x-x1234 (บัญชี NOVAT)"
        description="รอยืนยันรายชื่อบัญชีรับเงิน (Q13)"
      />
      <div>
        <Text size="sm" fw={500} mb={4}>
          สลิปการโอน (แนบได้ไม่จำกัด)
        </Text>
        <SlipThumbnails count={2} />
      </div>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <NumberInput
          label="ยอดที่ได้รับ"
          value={received}
          onChange={setReceived}
          thousandSeparator
          rightSection="บาท"
        />
        <TextInput
          label="วันเวลาที่รับเงิน"
          defaultValue={formatThaiDate(nowThai(), 'DD/MM/BBBB HH:mm')}
        />
      </SimpleGrid>
      {diff !== 0 && (
        <Alert color="orange" variant="light">
          ยอดรับ{diff > 0 ? 'เกิน' : 'ขาด'} {formatBaht(Math.abs(diff))} · ระบบบันทึกเป็นส่วนต่าง
          (วิธีจัดการรอยืนยัน Q15)
        </Alert>
      )}
    </ConfirmModal>
  );
}
