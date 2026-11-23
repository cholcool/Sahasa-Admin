import {
  Badge,
  Divider,
  Group,
  Radio,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { createCustomer } from '@/features/mock/actions';
import type { Billing, MockAddress, MockCustomer } from '@/features/mock/types';
import { CHANNEL_LABEL_TH, MANUAL_CHANNELS } from '@/features/orders/labels';

interface ModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Modal · เลือกลูกค้า */
export function CustomerPickerModal({
  opened,
  onClose,
  customers,
  initialId,
  onSelect,
}: ModalProps & {
  customers: MockCustomer[];
  initialId?: string;
  onSelect: (id: string) => void;
}) {
  const [value, setValue] = useState(initialId ?? '');
  const [q, setQ] = useState('');
  const query = q.trim().replace(/-/g, '').toLowerCase();
  const found = customers.filter(
    (c) =>
      !query || c.name.toLowerCase().includes(query) || c.phone.replace(/-/g, '').includes(query),
  );
  const picked = customers.find((c) => c.id === value);
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="เลือกลูกค้า"
      confirmLabel="เลือกลูกค้านี้"
      confirmDisabled={!picked}
      doneMessage={picked ? `เลือก ${picked.name} แล้ว` : undefined}
      onConfirm={() => picked && onSelect(picked.id)}
    >
      <TextInput
        leftSection={<IconSearch size={16} />}
        placeholder="ค้นหาเบอร์โทรหรือชื่อ"
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        data-autofocus
      />
      <Text size="sm" c="dimmed">
        พบ {found.length} รายการ
      </Text>
      <ScrollArea.Autosize mah={360}>
        <Radio.Group value={value} onChange={setValue}>
          <Stack gap="xs">
            {found.slice(0, 50).map((c) => (
              <Radio.Card key={c.id} value={c.id} p="sm" radius="md">
                <Group wrap="nowrap" align="flex-start">
                  <Radio.Indicator />
                  <div>
                    <Group gap={6}>
                      <Text fw={600}>{c.name}</Text>
                      <Badge size="xs" variant="light" color="gray">
                        {CHANNEL_LABEL_TH[c.channel]}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {c.phone} · ที่อยู่ {c.addresses.length} แห่ง · {c.billing}
                    </Text>
                  </div>
                </Group>
              </Radio.Card>
            ))}
          </Stack>
        </Radio.Group>
      </ScrollArea.Autosize>
    </ConfirmModal>
  );
}

/** Modal · ลูกค้าใหม่ */
export function NewCustomerModal({
  opened,
  onClose,
  onCreated,
}: ModalProps & { onCreated: (id: string) => void }) {
  const [form, setForm] = useState({
    name: '',
    channel: 'line' as (typeof MANUAL_CHANNELS)[number],
    phone: '',
    billing: 'NOVAT' as Billing,
    taxId: '',
    recipient: '',
    recipientPhone: '',
    address: '',
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const valid =
    form.name.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.address.trim() !== '' &&
    (form.billing === 'NOVAT' || form.taxId.trim() !== '');

  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="สร้างลูกค้าใหม่"
      confirmLabel="บันทึกและเลือกลูกค้า"
      doneMessage="สร้างลูกค้าใหม่แล้ว"
      confirmDisabled={!valid}
      size="xl"
      onConfirm={() => {
        const id = createCustomer({
          name: form.name.trim(),
          channel: form.channel,
          phone: form.phone.trim(),
          billing: form.billing,
          taxId: form.billing === 'VAT' ? form.taxId.trim() : undefined,
          address: {
            name: form.recipient.trim() || form.name.trim(),
            phone: form.recipientPhone.trim() || form.phone.trim(),
            text: form.address.trim(),
          },
        });
        onCreated(id);
      }}
    >
      <Title order={5}>ข้อมูลลูกค้า</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          label="ชื่อลูกค้า / ร้าน"
          withAsterisk
          placeholder="เช่น ร้านเจ๊หมวย"
          value={form.name}
          onChange={(e) => set({ name: e.currentTarget.value })}
        />
        <Select
          label="ช่องทางหลัก"
          data={MANUAL_CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL_TH[c] }))}
          value={form.channel}
          onChange={(v) => set({ channel: MANUAL_CHANNELS.find((c) => c === v) ?? 'line' })}
        />
        <TextInput
          label="เบอร์โทร"
          withAsterisk
          placeholder="08x-xxx-xxxx"
          value={form.phone}
          onChange={(e) => set({ phone: e.currentTarget.value })}
        />
      </SimpleGrid>
      <Divider />
      <Title order={5}>การออกบิล</Title>
      <SegmentedControl
        data={['NOVAT', 'VAT']}
        value={form.billing}
        onChange={(v) => set({ billing: v === 'VAT' ? 'VAT' : 'NOVAT' })}
        w="fit-content"
      />
      {form.billing === 'VAT' && (
        <TextInput
          label="เลขประจำตัวผู้เสียภาษี"
          withAsterisk
          placeholder="13 หลัก"
          value={form.taxId}
          onChange={(e) => set({ taxId: e.currentTarget.value })}
        />
      )}
      <Divider />
      <Title order={5}>ที่อยู่จัดส่ง</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          label="ชื่อผู้รับ"
          placeholder="ถ้าว่างใช้ชื่อลูกค้า"
          value={form.recipient}
          onChange={(e) => set({ recipient: e.currentTarget.value })}
        />
        <TextInput
          label="เบอร์ผู้รับ"
          placeholder="ถ้าว่างใช้เบอร์ลูกค้า"
          value={form.recipientPhone}
          onChange={(e) => set({ recipientPhone: e.currentTarget.value })}
        />
        <Textarea
          label="ที่อยู่"
          withAsterisk
          placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
          value={form.address}
          onChange={(e) => set({ address: e.currentTarget.value })}
          style={{ gridColumn: '1 / -1' }}
        />
      </SimpleGrid>
    </ConfirmModal>
  );
}

/** Modal · ที่อยู่จัดส่ง */
export function AddressPickerModal({
  opened,
  onClose,
  customerName,
  addresses,
  initialId,
  onSelect,
}: ModalProps & {
  customerName: string;
  addresses: MockAddress[];
  initialId?: string;
  onSelect: (id: string) => void;
}) {
  const [value, setValue] = useState(initialId ?? addresses[0]?.id ?? '');
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title={`ที่อยู่จัดส่ง · ${customerName}`}
      confirmLabel="ใช้ที่อยู่นี้"
      doneMessage="เปลี่ยนที่อยู่จัดส่งแล้ว"
      onConfirm={() => onSelect(value)}
    >
      <Radio.Group value={value} onChange={setValue}>
        <Stack gap="xs">
          {addresses.map((a) => (
            <Radio.Card key={a.id} value={a.id} p="sm" radius="md">
              <Group wrap="nowrap" align="flex-start">
                <Radio.Indicator />
                <div>
                  <Group gap={6}>
                    <Text fw={600}>{a.name}</Text>
                    {a.isDefault && (
                      <Badge size="xs" variant="light">
                        ค่าเริ่มต้น
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {a.text} · {a.phone}
                  </Text>
                </div>
              </Group>
            </Radio.Card>
          ))}
        </Stack>
      </Radio.Group>
    </ConfirmModal>
  );
}
