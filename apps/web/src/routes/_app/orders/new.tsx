import {
  Alert,
  Button,
  Divider,
  FileInput,
  Grid,
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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconUpload } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { type ReactNode, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import {
  AddressPickerModal,
  CustomerPickerModal,
  NewCustomerModal,
} from '@/features/orders/components/CustomerModals';
import { LineItemsEditor, type EditableLine } from '@/features/orders/components/LineItemsEditor';
import { CARRIERS, CHANNEL_LABEL_TH, MANUAL_CHANNELS } from '@/features/orders/labels';
import { MOCK_PRODUCTS, ROUNDS } from '@/features/orders/mock-data';
import { orderTotals } from '@/features/orders/order-math';
import { formatBaht } from '@/lib/format';
import { notifyDone } from '@/lib/notify';

/** 03-02 Create manual order (SRS 10–14, pending client confirmation) */
export const Route = createFileRoute('/_app/orders/new')({
  component: CreateOrderPage,
});

// TODO: shipping fee rule for manual channels is pending (Q2–Q5)
const SHIPPING_FEE = 50;

const INITIAL_LINES: EditableLine[] = MOCK_PRODUCTS.map((p, i) => ({
  productId: p.id,
  name: p.name,
  unit: p.unit,
  basePrice: p.price,
  qty: i === 0 ? 5 : 2,
  price: p.price,
}));

// TODO: call the create-order API
const save = () => notifyDone('สร้าง ORD-000153 แล้ว · สถานะรอตรวจสอบ');

type ManualChannel = (typeof MANUAL_CHANNELS)[number];

function CreateOrderPage() {
  const [channel, setChannel] = useState<ManualChannel>('line');
  const [billing, setBilling] = useState('NOVAT');
  const [payment, setPayment] = useState('โอน');
  const [carrier, setCarrier] = useState<string | null>(CARRIERS[1] ?? null);
  const [round, setRound] = useState<string | null>(ROUNDS[1] ?? null);
  const [lines, setLines] = useState(INITIAL_LINES);
  const [cutoffOpened, cutoff] = useDisclosure(false);
  const [custOpened, cust] = useDisclosure(false);
  const [newCustOpened, newCust] = useDisclosure(false);
  const [addrOpened, addr] = useDisclosure(false);
  const totals = orderTotals(lines, SHIPPING_FEE);

  return (
    <Stack>
      <PageHeader
        title="สร้าง Order Manual"
        description="สำหรับ Order จาก Line / Facebook / หน้าร้าน / โทร"
        pending
        actions={
          <>
            <Button variant="default" component={Link} to="/orders">
              ยกเลิก
            </Button>
            <Button onClick={save}>บันทึก Order</Button>
          </>
        }
      />
      <Alert color="orange" variant="light">
        <Group justify="space-between">
          <Text size="sm">ตอนนี้ 12:20 น. เลยเวลาตัดรอบวันนี้แล้ว · Order จะเข้ารอบ 14 พ.ย. 12:00</Text>
          <Button size="xs" variant="default" onClick={cutoff.open}>
            เพิ่มเข้ารอบวันนี้
          </Button>
        </Group>
      </Alert>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <SectionCard title="ช่องทางการขาย *">
              <SegmentedControl
                value={channel}
                onChange={(v) => setChannel(MANUAL_CHANNELS.find((c) => c === v) ?? 'line')}
                data={MANUAL_CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL_TH[c] }))}
              />
              <Text size="xs" c="dimmed" mt={6}>
                ต้องเลือกช่องทางที่รับ Order ทุกครั้ง
              </Text>
            </SectionCard>

            <SectionCard title="ลูกค้า">
              <Stack>
                <Group>
                  <TextInput
                    flex={1}
                    leftSection={<IconSearch size={16} />}
                    placeholder="ค้นหาเบอร์โทรหรือชื่อ"
                  />
                  <Button variant="default" onClick={cust.open}>
                    เลือกลูกค้า
                  </Button>
                  <Button variant="default" onClick={newCust.open}>
                    ลูกค้าใหม่
                  </Button>
                </Group>
                <Paper withBorder p="sm" radius="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={600}>ร้านเจ๊หมวย</Text>
                      <Text size="xs" c="dimmed">
                        081-234-5678 · ลูกค้า Line
                      </Text>
                    </div>
                    <Button size="xs" variant="subtle" onClick={cust.open}>
                      เปลี่ยน
                    </Button>
                  </Group>
                </Paper>
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    ที่อยู่จัดส่ง
                  </Text>
                  <Paper withBorder p="sm" radius="md">
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm">99/9 ถ.ตัวอย่าง ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110</Text>
                      <Button size="xs" variant="subtle" onClick={addr.open}>
                        เปลี่ยน
                      </Button>
                    </Group>
                  </Paper>
                </div>
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    ประเภทการออกบิล
                  </Text>
                  <SegmentedControl data={['NOVAT', 'VAT']} value={billing} onChange={setBilling} />
                </div>
              </Stack>
            </SectionCard>

            <SectionCard title="สินค้า">
              <LineItemsEditor lines={lines} onChange={setLines} products={MOCK_PRODUCTS} />
              <Text size="xs" c="dimmed" mt="xs">
                แก้จำนวนและราคาต่อหน่วยได้ทุกรายการ · กรอบสีแดง = ราคาต่างจากราคาตั้ง ·
                วิธีคิดราคาและค่าส่งของช่องทาง Manual รอยืนยัน (Q2–Q5)
              </Text>
            </SectionCard>

            <SectionCard title="การจัดส่ง">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select label="ขนส่ง" data={CARRIERS} value={carrier} onChange={setCarrier} />
                <Select
                  label="รอบการส่ง"
                  data={ROUNDS.slice(1)}
                  value={round}
                  onChange={setRound}
                  description="เลือกวันอื่นได้ = Order ล่วงหน้า"
                />
              </SimpleGrid>
            </SectionCard>

            <SectionCard title="การชำระเงิน">
              <Stack>
                <SegmentedControl
                  data={['โอน', 'เงินสด']}
                  value={payment}
                  onChange={setPayment}
                  w="fit-content"
                />
                {payment === 'โอน' && (
                  <FileInput
                    multiple
                    clearable
                    label="แนบสลิป (ได้หลายไฟล์)"
                    description="JPG, PNG, PDF"
                    placeholder="เลือกไฟล์สลิป"
                    accept="image/png,image/jpeg,application/pdf"
                    leftSection={<IconUpload size={16} />}
                  />
                )}
              </Stack>
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder radius="lg" p="md" pos="sticky" top={72}>
            <Stack gap="xs">
              <Text fw={700} size="lg">
                สรุป Order
              </Text>
              <SummaryRow label="ช่องทาง" value={CHANNEL_LABEL_TH[channel]} />
              <SummaryRow label="ลูกค้า" value="ร้านเจ๊หมวย" />
              <SummaryRow label="รอบส่ง" value={round ?? '-'} />
              <Divider />
              <SummaryRow label="ยอดสินค้า" value={formatBaht(totals.items)} />
              <SummaryRow label="ค่าส่ง" value={formatBaht(totals.shipping)} />
              <Divider />
              <SummaryRow label="ยอดรวม" value={<b>{formatBaht(totals.total)}</b>} />
              <Button fullWidth mt="sm" onClick={save}>
                บันทึก Order
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <CutoffModal opened={cutoffOpened} onClose={cutoff.close} />
      <CustomerPickerModal opened={custOpened} onClose={cust.close} onCreateNew={newCust.open} />
      <NewCustomerModal opened={newCustOpened} onClose={newCust.close} />
      <AddressPickerModal opened={addrOpened} onClose={addr.close} />
    </Stack>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Group justify="space-between">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}

/** Modal · เพิ่มหลังตัดรอบ */
function CutoffModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [choice, setChoice] = useState('today');
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="เพิ่ม Order หลังตัดรอบ"
      confirmLabel="ยืนยัน"
      doneMessage={choice === 'today' ? 'เพิ่มเข้ารอบวันนี้แล้ว · แจ้งเตือนโรงงาน' : 'ส่งรอบถัดไปแล้ว'}
    >
      <Alert color="orange" variant="light">
        รอบ 13 พ.ย. 12:00 ตัดรอบไปแล้วเมื่อ 20 นาทีที่แล้ว
      </Alert>
      <Radio.Group value={choice} onChange={setChoice}>
        <Stack gap="xs">
          <Radio.Card value="today" p="sm" radius="md">
            <Group wrap="nowrap" align="flex-start">
              <Radio.Indicator />
              <div>
                <Text fw={600}>เพิ่มเข้ารอบวันนี้ (13 พ.ย.)</Text>
                <Text size="xs" c="dimmed">
                  เฉพาะหัวหน้า/Admin · ระบบแจ้งเตือนโรงงานและอัปเดตยอดผลิต
                </Text>
              </div>
            </Group>
          </Radio.Card>
          <Radio.Card value="next" p="sm" radius="md">
            <Group wrap="nowrap" align="flex-start">
              <Radio.Indicator />
              <div>
                <Text fw={600}>ส่งรอบถัดไป (14 พ.ย. 12:00)</Text>
                <Text size="xs" c="dimmed">
                  ไม่กระทบรอบที่ตัดแล้ว
                </Text>
              </div>
            </Group>
          </Radio.Card>
        </Stack>
      </Radio.Group>
      <Textarea label="เหตุผล" withAsterisk placeholder="เช่น ลูกค้าประจำขอด่วน" />
      <Text size="xs" c="dimmed">
        Role &quot;หัวหน้า&quot; รอยืนยัน (Q41)
      </Text>
    </ConfirmModal>
  );
}
