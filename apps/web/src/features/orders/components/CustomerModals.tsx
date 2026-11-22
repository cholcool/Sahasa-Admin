import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  Radio,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { MOCK_ADDRESSES, MOCK_CUSTOMERS } from '@/features/orders/mock-data';

interface ModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Modal · เลือกลูกค้า */
export function CustomerPickerModal({
  opened,
  onClose,
  onCreateNew,
}: ModalProps & { onCreateNew: () => void }) {
  const [value, setValue] = useState(MOCK_CUSTOMERS[0]?.name ?? '');
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="เลือกลูกค้า"
      confirmLabel="เลือกลูกค้านี้"
      doneMessage={`เลือก${value}แล้ว`}
    >
      <TextInput leftSection={<IconSearch size={16} />} defaultValue="081" />
      <Text size="sm" c="dimmed">
        พบ {MOCK_CUSTOMERS.length} รายการ
      </Text>
      <Radio.Group value={value} onChange={setValue}>
        <Stack gap="xs">
          {MOCK_CUSTOMERS.map((c) => (
            <Radio.Card key={c.name} value={c.name} p="sm" radius="md">
              <Group wrap="nowrap" align="flex-start">
                <Radio.Indicator />
                <div>
                  <Group gap={6}>
                    <Text fw={600}>{c.name}</Text>
                    <Badge size="xs" variant="light" color="gray">
                      {c.channel}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {c.phone} · ที่อยู่ {c.addresses} แห่ง · {c.billing}
                  </Text>
                </div>
              </Group>
            </Radio.Card>
          ))}
        </Stack>
      </Radio.Group>
      <Button
        variant="subtle"
        leftSection={<IconPlus size={16} />}
        onClick={() => {
          onClose();
          onCreateNew();
        }}
      >
        สร้างลูกค้าใหม่
      </Button>
    </ConfirmModal>
  );
}

/** Modal · ลูกค้าใหม่ */
export function NewCustomerModal({ opened, onClose }: ModalProps) {
  const [billing, setBilling] = useState('VAT');
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="สร้างลูกค้าใหม่"
      confirmLabel="บันทึกและเลือกลูกค้า"
      doneMessage="สร้างลูกค้าใหม่แล้ว"
      size="xl"
    >
      <Title order={5}>ข้อมูลลูกค้า</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="ชื่อลูกค้า / ร้าน" withAsterisk placeholder="เช่น ร้านเจ๊หมวย" />
        <Select
          label="ช่องทางหลัก"
          data={['Line', 'Facebook', 'หน้าร้าน', 'โทร']}
          defaultValue="Line"
        />
        <TextInput label="เบอร์โทร" withAsterisk defaultValue="081-234-5678" />
        <TextInput label="เบอร์โทรเพิ่มเติม" placeholder="ไม่บังคับ" />
      </SimpleGrid>
      <Button variant="subtle" leftSection={<IconPlus size={16} />} w="fit-content">
        เพิ่มเบอร์โทร
      </Button>
      <Divider />
      <Title order={5}>การออกบิล</Title>
      <SegmentedControl
        data={['NOVAT', 'VAT']}
        value={billing}
        onChange={setBilling}
        w="fit-content"
      />
      {billing === 'VAT' && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="ชื่อบริษัทในใบกำกับ" withAsterisk defaultValue="บจก. สยามฟู้ด" />
          <TextInput label="เลขประจำตัวผู้เสียภาษี" withAsterisk defaultValue="0105561234567" />
          <Select label="สาขา" data={['สำนักงานใหญ่', 'สาขา']} defaultValue="สำนักงานใหญ่" />
          <TextInput label="อีเมลรับเอกสาร" placeholder="acc@company.com" />
          <Textarea
            label="ที่อยู่ใบกำกับภาษี"
            placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
            style={{ gridColumn: '1 / -1' }}
          />
        </SimpleGrid>
      )}
      <Divider />
      <Group justify="space-between">
        <Title order={5}>ที่อยู่จัดส่ง</Title>
        <Checkbox label="ใช้ที่อยู่เดียวกับใบกำกับ" />
      </Group>
      <AddressFields />
    </ConfirmModal>
  );
}

function AddressFields() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <TextInput label="ชื่อผู้รับ" withAsterisk placeholder="ชื่อผู้รับสินค้า" />
      <TextInput label="เบอร์ผู้รับ" withAsterisk placeholder="08x-xxx-xxxx" />
      <TextInput
        label="ที่อยู่"
        withAsterisk
        placeholder="บ้านเลขที่ หมู่ ซอย ถนน"
        style={{ gridColumn: '1 / -1' }}
      />
      <TextInput label="ตำบล / อำเภอ" placeholder="พิมพ์เพื่อค้นหา" />
      <TextInput label="จังหวัด / รหัสไปรษณีย์" value="สงขลา 90110" disabled readOnly />
    </SimpleGrid>
  );
}

/** Modal · ที่อยู่จัดส่ง */
export function AddressPickerModal({ opened, onClose }: ModalProps) {
  const [value, setValue] = useState('a1');
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="ที่อยู่จัดส่ง · ร้านเจ๊หมวย"
      confirmLabel="ใช้ที่อยู่นี้"
      doneMessage="เปลี่ยนที่อยู่จัดส่งแล้ว"
    >
      <Radio.Group value={value} onChange={setValue}>
        <Stack gap="xs">
          {MOCK_ADDRESSES.map((a) => (
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
                    {a.text}
                  </Text>
                </div>
              </Group>
            </Radio.Card>
          ))}
        </Stack>
      </Radio.Group>
      <Paper withBorder p="md" radius="md" style={{ borderStyle: 'dashed' }}>
        <Stack gap="sm">
          <Text fw={600}>เพิ่มที่อยู่ใหม่</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="ชื่อผู้รับ" placeholder="ชื่อผู้รับ" />
            <TextInput label="เบอร์ผู้รับ" placeholder="08x-xxx-xxxx" />
            <TextInput
              label="ที่อยู่"
              placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
              style={{ gridColumn: '1 / -1' }}
            />
          </SimpleGrid>
          <Checkbox label="ตั้งเป็นที่อยู่ค่าเริ่มต้น" />
        </Stack>
      </Paper>
    </ConfirmModal>
  );
}
