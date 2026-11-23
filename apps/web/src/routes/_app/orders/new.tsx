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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconUpload } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type ReactNode, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { createOrder } from '@/features/mock/actions';
import {
  minOrderQty,
  PRICE_GROUPS,
  REGION_LABEL,
  regionOf,
  TOFU_ID,
} from '@/features/mock/pricing';
import {
  linePrice,
  orderShipping,
  productOptions,
  roundChoices,
  roundText,
} from '@/features/mock/selectors';
import { getMockDb, useMockDb } from '@/features/mock/store';
import type { PriceGroup } from '@/features/mock/pricing';
import type { Billing, CarrierId } from '@/features/mock/types';
import {
  AddressPickerModal,
  CustomerPickerModal,
  NewCustomerModal,
} from '@/features/orders/components/CustomerModals';
import { LineItemsEditor, type EditableLine } from '@/features/orders/components/LineItemsEditor';
import { CHANNEL_LABEL_TH, MANUAL_CHANNELS } from '@/features/orders/labels';
import { orderTotals } from '@/features/orders/order-math';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';
import { formatBaht } from '@/lib/format';
import { notifyDone } from '@/lib/notify';

/** 03-02 Create manual order (SRS 10–14, pending client confirmation) */
export const Route = createFileRoute('/_app/orders/new')({
  component: CreateOrderPage,
});

type ManualChannel = (typeof MANUAL_CHANNELS)[number];

const CUTOFF_HOUR = 12;

function CreateOrderPage() {
  const db = useMockDb();
  const navigate = useNavigate();
  const today = todayIso();
  const now = dayjs().tz('Asia/Bangkok');
  const pastCutoff = now.hour() >= CUTOFF_HOUR;
  const nextRound = pastCutoff ? dayjs(today).add(1, 'day').format('YYYY-MM-DD') : today;

  const [channel, setChannel] = useState<ManualChannel>('line');
  const customers = db.customers.filter((c) => c.regular);
  const [customerId, setCustomerId] = useState<string | undefined>(
    () => customers.find((c) => c.channel === 'line')?.id,
  );
  const customer = db.customers.find((c) => c.id === customerId);
  const [addressId, setAddressId] = useState<string | undefined>();
  const address =
    customer?.addresses.find((a) => a.id === addressId) ??
    customer?.addresses.find((a) => a.isDefault);
  const [billing, setBilling] = useState<Billing>(customer?.billing ?? 'NOVAT');
  const [payment, setPayment] = useState('โอน');
  const [slips, setSlips] = useState<File[]>([]);
  const [carrier, setCarrier] = useState<CarrierId>('nim');
  const [round, setRound] = useState<string>(nextRound);
  const [inserted, setInserted] = useState(false);
  const group = customer?.priceGroup;
  const products = productOptions(db, channel, group);

  /** Tier price follows qty/channel/customer; a price typed by hand is kept */
  const reprice = (
    ls: EditableLine[],
    ch: ManualChannel,
    g: PriceGroup | undefined,
  ): EditableLine[] =>
    ls.map((l) => {
      const tier = linePrice(db, l.productId, ch, l.qty, g);
      return { ...l, basePrice: tier, price: l.price === l.basePrice ? tier : l.price };
    });
  const [lines, setLines] = useState<EditableLine[]>(() =>
    reprice(
      products.slice(0, 1).map((p) => ({
        productId: p.id,
        name: p.name,
        unit: p.unit,
        basePrice: p.price,
        qty: 10,
        price: p.price,
      })),
      'line',
      customers.find((c) => c.channel === 'line')?.priceGroup,
    ),
  );
  const [cutoffOpened, cutoff] = useDisclosure(false);
  const [custOpened, cust] = useDisclosure(false);
  const [newCustOpened, newCust] = useDisclosure(false);
  const [addrOpened, addr] = useDisclosure(false);
  const shipping = orderShipping(db, {
    channel,
    carrierId: carrier,
    address: address?.text ?? '',
    productIds: lines.filter((l) => l.qty > 0).map((l) => l.productId),
  });
  const totals = orderTotals(lines, shipping.fee);
  const tofuLine = lines.find((l) => l.productId === TOFU_ID);
  const minTofu = minOrderQty(db.priceRules, TOFU_ID, channel);
  const belowMinimum = !group && tofuLine !== undefined && tofuLine.qty < minTofu;
  const rounds = roundChoices(db, today, 0, 5).filter(
    (d) => d >= nextRound || (inserted && d === today),
  );

  const selectCustomer = (id: string) => {
    // A just-created customer is already saved but may not be in this render's snapshot yet
    const c = getMockDb().customers.find((x) => x.id === id);
    setCustomerId(id);
    setAddressId(undefined);
    if (c) setBilling(c.billing);
    setLines((ls) => reprice(ls, channel, c?.priceGroup));
  };

  const changeChannel = (next: ManualChannel) => {
    setChannel(next);
    setLines((ls) => reprice(ls, next, group));
    if (next === 'storefront') setCarrier('store');
  };

  const canSave = Boolean(customer) && lines.some((l) => l.qty > 0) && !belowMinimum;
  const save = () => {
    if (!customer) return;
    const orderNumber = createOrder({
      channel,
      customerId: customer.id,
      addressId: address?.id,
      billing,
      lines: lines.map(({ productId, name, qty, price }) => ({ productId, name, qty, price })),
      carrierId: carrier,
      roundDate: round,
      paymentMethod: payment === 'เงินสด' ? 'cash' : 'transfer',
      paid: payment === 'เงินสด' || slips.length > 0,
      insertedAfterCutoff: inserted,
    });
    notifyDone(`สร้าง ${orderNumber} แล้ว · สถานะรอตรวจสอบ`);
    void navigate({ to: '/orders/$orderId', params: { orderId: orderNumber } });
  };

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
            <Button onClick={save} disabled={!canSave}>
              บันทึก Order
            </Button>
          </>
        }
      />
      {pastCutoff && !inserted ? (
        <Alert color="orange" variant="light">
          <Group justify="space-between">
            <Text size="sm">
              ตอนนี้ {now.format('HH:mm')} น. เลยเวลาตัดรอบวันนี้แล้ว · Order จะเข้ารอบ{' '}
              {formatThaiDate(nextRound, 'D MMM')} 12:00
            </Text>
            <Button size="xs" variant="default" onClick={cutoff.open}>
              เพิ่มเข้ารอบวันนี้
            </Button>
          </Group>
        </Alert>
      ) : (
        <Alert color={inserted ? 'orange' : 'blue'} variant="light">
          {inserted
            ? `แทรกเข้ารอบวันนี้ (${formatThaiDate(today, 'D MMM')}) หลังตัดรอบ · ระบบจะแจ้งเตือนโรงงาน`
            : `ตัดรอบวันนี้ 12:00 น. · Order ที่บันทึกตอนนี้เข้ารอบ ${formatThaiDate(today, 'D MMM')}`}
        </Alert>
      )}

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <SectionCard title="ช่องทางการขาย *">
              <SegmentedControl
                value={channel}
                onChange={(v) => changeChannel(MANUAL_CHANNELS.find((c) => c === v) ?? 'line')}
                data={MANUAL_CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL_TH[c] }))}
              />
              <Text size="xs" c="dimmed" mt={6}>
                ต้องเลือกช่องทางที่รับ Order ทุกครั้ง
              </Text>
            </SectionCard>

            <SectionCard title="ลูกค้า">
              <Stack>
                <Group>
                  <Button
                    variant="default"
                    leftSection={<IconSearch size={16} />}
                    onClick={cust.open}
                  >
                    ค้นหา / เลือกลูกค้า
                  </Button>
                  <Button variant="default" onClick={newCust.open}>
                    ลูกค้าใหม่
                  </Button>
                </Group>
                {customer ? (
                  <Paper withBorder p="sm" radius="md">
                    <Group justify="space-between">
                      <div>
                        <Text fw={600}>{customer.name}</Text>
                        <Text size="xs" c="dimmed">
                          {customer.phone} · ลูกค้า {CHANNEL_LABEL_TH[customer.channel]}
                        </Text>
                      </div>
                      <Button size="xs" variant="subtle" onClick={cust.open}>
                        เปลี่ยน
                      </Button>
                    </Group>
                  </Paper>
                ) : (
                  <Text c="dimmed" size="sm">
                    ยังไม่ได้เลือกลูกค้า
                  </Text>
                )}
                {address && (
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      ที่อยู่จัดส่ง
                    </Text>
                    <Paper withBorder p="sm" radius="md">
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm">
                          {address.name} · {address.text}
                        </Text>
                        <Button size="xs" variant="subtle" onClick={addr.open}>
                          เปลี่ยน
                        </Button>
                      </Group>
                    </Paper>
                  </div>
                )}
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    ประเภทการออกบิล
                  </Text>
                  <SegmentedControl
                    data={['NOVAT', 'VAT']}
                    value={billing}
                    onChange={(v) => setBilling(v === 'VAT' ? 'VAT' : 'NOVAT')}
                  />
                </div>
              </Stack>
            </SectionCard>

            <SectionCard title="สินค้า">
              <LineItemsEditor
                lines={lines}
                onChange={(ls) => setLines(reprice(ls, channel, group))}
                products={products}
              />
              {group && (
                <Alert color="blue" variant="light" mt="xs">
                  ลูกค้ามีราคาพิเศษ: {PRICE_GROUPS[group]}
                </Alert>
              )}
              {belowMinimum && (
                <Alert color="orange" variant="light" mt="xs">
                  ช่องทาง {CHANNEL_LABEL_TH[channel]} สั่งเต้าหู้ขั้นต่ำ {minTofu} ชิ้น
                </Alert>
              )}
              <Text size="xs" c="dimmed" mt="xs">
                ราคาต่อหน่วยคิดตามจำนวน ช่องทาง และกลุ่มลูกค้า (Project Detail › ราคาสินค้า) · แก้ราคาเองได้ ·
                กรอบสีแดง = ราคาต่างจากราคาตั้ง
              </Text>
            </SectionCard>

            <SectionCard title="การจัดส่ง">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select
                  label="ขนส่ง"
                  data={db.carriers.map((c) => ({ value: c.id, label: c.fullName }))}
                  value={carrier}
                  onChange={(v) => {
                    const next = db.carriers.find((c) => c.id === v);
                    if (next) setCarrier(next.id);
                  }}
                />
                <Select
                  label="รอบการส่ง"
                  data={rounds.map((d) => ({ value: d, label: roundText(d) }))}
                  value={round}
                  onChange={(v) => v && setRound(v)}
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
                    description="ไม่แนบสลิป = รอยืนยันรับเงิน · Mockup ไม่อัปโหลดไฟล์จริง"
                    placeholder="เลือกไฟล์สลิป"
                    accept="image/png,image/jpeg,application/pdf"
                    leftSection={<IconUpload size={16} />}
                    value={slips}
                    onChange={setSlips}
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
              <SummaryRow label="ลูกค้า" value={customer?.name ?? '-'} />
              <SummaryRow label="รอบส่ง" value={roundText(round)} />
              <Divider />
              <SummaryRow label="ยอดสินค้า" value={formatBaht(totals.items)} />
              <SummaryRow label="ค่าส่ง" value={formatBaht(totals.shipping)} />
              <Text size="xs" c="dimmed">
                {shipping.rule
                  ? `${shipping.rule.condition}${address ? ` · ${REGION_LABEL[regionOf(address.text)]}` : ''}`
                  : 'ไม่คิดค่าส่ง (รับที่หน้าร้าน)'}
              </Text>
              <Divider />
              <SummaryRow label="ยอดรวม" value={<b>{formatBaht(totals.total)}</b>} />
              <Button fullWidth mt="sm" onClick={save} disabled={!canSave}>
                บันทึก Order
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <CutoffModal
        opened={cutoffOpened}
        onClose={cutoff.close}
        today={today}
        nextRound={nextRound}
        onChoose={(choice) => {
          setInserted(choice === 'today');
          setRound(choice === 'today' ? today : nextRound);
        }}
      />
      <CustomerPickerModal
        key={`pick-${custOpened}`}
        opened={custOpened}
        onClose={cust.close}
        customers={customers}
        initialId={customerId}
        onSelect={selectCustomer}
      />
      <NewCustomerModal
        key={`new-${newCustOpened}`}
        opened={newCustOpened}
        onClose={newCust.close}
        onCreated={selectCustomer}
      />
      {customer && (
        <AddressPickerModal
          key={`addr-${customer.id}-${addrOpened}`}
          opened={addrOpened}
          onClose={addr.close}
          customerName={customer.name}
          addresses={customer.addresses}
          initialId={address?.id}
          onSelect={setAddressId}
        />
      )}
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
function CutoffModal({
  opened,
  onClose,
  today,
  nextRound,
  onChoose,
}: {
  opened: boolean;
  onClose: () => void;
  today: string;
  nextRound: string;
  onChoose: (choice: 'today' | 'next') => void;
}) {
  const [choice, setChoice] = useState<'today' | 'next'>('today');
  const [reason, setReason] = useState('');
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title="เพิ่ม Order หลังตัดรอบ"
      confirmLabel="ยืนยัน"
      confirmDisabled={choice === 'today' && reason.trim() === ''}
      doneMessage={choice === 'today' ? 'เพิ่มเข้ารอบวันนี้แล้ว · แจ้งโรงงานเมื่อบันทึก Order' : 'ส่งรอบถัดไป'}
      onConfirm={() => onChoose(choice)}
    >
      <Alert color="orange" variant="light">
        รอบ {formatThaiDate(today, 'D MMM')} 12:00 ตัดรอบไปแล้ว
      </Alert>
      <Radio.Group value={choice} onChange={(v) => setChoice(v === 'next' ? 'next' : 'today')}>
        <Stack gap="xs">
          <Radio.Card value="today" p="sm" radius="md">
            <Group wrap="nowrap" align="flex-start">
              <Radio.Indicator />
              <div>
                <Text fw={600}>เพิ่มเข้ารอบวันนี้ ({formatThaiDate(today, 'D MMM')})</Text>
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
                <Text fw={600}>ส่งรอบถัดไป ({formatThaiDate(nextRound, 'D MMM')} 12:00)</Text>
                <Text size="xs" c="dimmed">
                  ไม่กระทบรอบที่ตัดแล้ว
                </Text>
              </div>
            </Group>
          </Radio.Card>
        </Stack>
      </Radio.Group>
      <Textarea
        label="เหตุผล"
        withAsterisk={choice === 'today'}
        placeholder="เช่น ลูกค้าประจำขอด่วน"
        value={reason}
        onChange={(e) => setReason(e.currentTarget.value)}
      />
      <Text size="xs" c="dimmed">
        Role &quot;หัวหน้า&quot; รอยืนยัน (Q41)
      </Text>
    </ConfirmModal>
  );
}
