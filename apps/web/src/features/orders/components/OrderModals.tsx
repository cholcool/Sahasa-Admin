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
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SlipThumbnails } from '@/features/orders/components/SlipThumbnails';
import { CANCEL_REASONS } from '@/features/orders/labels';
import { formatBaht } from '@/lib/format';

interface ModalProps {
  opened: boolean;
  onClose: () => void;
  orderNumber: string;
}

/** Modal · ยกเลิก Order */
export function CancelOrderModal({ opened, onClose, orderNumber }: ModalProps) {
  const [reason, setReason] = useState(CANCEL_REASONS[0] ?? '');
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="ยกเลิก Order"
      confirmLabel="ยืนยันการยกเลิก"
      confirmColor="brand"
      doneMessage={`ยกเลิก ${orderNumber} แล้ว · แจ้งเตือนโรงงาน`}
    >
      <Alert color="brand" variant="light">
        Order นี้โรงงานรับแล้ว ระบบจะแจ้งเตือนโรงงานทันทีเมื่อยกเลิก
      </Alert>
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between">
          <div>
            <Text fw={600}>{orderNumber}</Text>
            <Text size="xs" c="dimmed">
              ร้านเจ๊หมวย · Line · ฿1,250
            </Text>
          </div>
          <StatusBadge>โรงงานรับแล้ว</StatusBadge>
        </Group>
      </Paper>
      <Radio.Group label="เหตุผลการยกเลิก" withAsterisk value={reason} onChange={setReason}>
        <Stack gap="xs" mt="xs">
          {CANCEL_REASONS.map((r) => (
            <Radio key={r} value={r} label={r} />
          ))}
        </Stack>
      </Radio.Group>
      <Textarea label="หมายเหตุเพิ่มเติม" placeholder="ระบุรายละเอียด (ถ้ามี)" />
      <Text size="xs" c="dimmed">
        ระบบจะไม่ลบข้อมูล Order และจะออกใบลดหนี้หากออกบิลไปแล้ว
      </Text>
    </ConfirmModal>
  );
}

/** Modal · ยืนยันการรับเงิน */
export function ConfirmPaymentModal({
  opened,
  onClose,
  orderNumber,
  amountDue,
}: ModalProps & { amountDue: number }) {
  const [method, setMethod] = useState('โอน');
  const [received, setReceived] = useState<number | string>(1259);
  const diff = Number(received) - amountDue;
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title={`ยืนยันการรับเงิน · ${orderNumber}`}
      confirmLabel="ยืนยันรับเงิน"
      confirmColor="gold"
      doneMessage="ยืนยันรับเงินแล้ว"
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
        <SegmentedControl
          data={['โอน', 'เงินสด', 'ชำระผ่าน Platform']}
          value={method}
          onChange={setMethod}
        />
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
        <TextInput label="วันเวลาที่รับเงิน" defaultValue="13/11/2569 09:40" />
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
