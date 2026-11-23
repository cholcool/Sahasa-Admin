import {
  Alert,
  Badge,
  Button,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { isMarketplace } from '@/features/mock/catalog';
import { updateOrder } from '@/features/mock/actions';
import {
  findOrder,
  linePrice,
  orderShipping,
  productOptions,
  roundChoices,
  roundText,
} from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import type { CarrierId, MockOrder } from '@/features/mock/types';
import { LineItemsEditor, type EditableLine } from '@/features/orders/components/LineItemsEditor';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { editDeadline } from '@/features/orders/edit-window';
import { orderTotals } from '@/features/orders/order-math';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';
import { formatBaht } from '@/lib/format';
import { notifyDone } from '@/lib/notify';

/** 03-05 Edit order (SRS 17, pending client confirmation) */
export const Route = createFileRoute('/_app/orders/$orderId/edit')({
  component: EditOrderPage,
});

function EditOrderPage() {
  const { orderId } = Route.useParams();
  const db = useMockDb();
  const order = findOrder(db, orderId);
  if (!order) {
    return (
      <Stack>
        <PageHeader title={`แก้ไข ${orderId}`} />
        <Alert color="orange" variant="light">
          ไม่พบ Order นี้ในข้อมูล Mockup ชุดปัจจุบัน
        </Alert>
      </Stack>
    );
  }
  return <EditOrderForm key={order.orderNumber} order={order} />;
}

function EditOrderForm({ order }: { order: MockOrder }) {
  const db = useMockDb();
  const navigate = useNavigate();
  const orderId = order.orderNumber;
  const customer = db.customers.find((c) => c.id === order.customerId);
  const products = productOptions(db, order.channel, customer?.priceGroup);
  const currentAddress = customer?.addresses.find((a) => a.text === order.address);

  const [lines, setLines] = useState<EditableLine[]>(() =>
    order.lines.map((l) => {
      const p = products.find((x) => x.id === l.productId);
      return { ...l, unit: p?.unit ?? '', basePrice: p?.price ?? l.price };
    }),
  );
  const [carrier, setCarrier] = useState<CarrierId>(order.carrierId);
  const [round, setRound] = useState<string>(order.roundDate);
  const [addressId, setAddressId] = useState<string | null>(currentAddress?.id ?? null);

  const deadline = editDeadline(order.roundDate);
  const locked =
    dayjs().isAfter(deadline) ||
    !['pending_review', 'confirmed', 'factory_accepted'].includes(order.status);
  const marketplace = isMarketplace(order.channel);

  const before = order.total;
  const newAddress = customer?.addresses.find((a) => a.id === addressId)?.text ?? order.address;
  const newShipping = orderShipping(db, {
    channel: order.channel,
    carrierId: carrier,
    address: newAddress,
    productIds: lines.filter((l) => l.qty > 0).map((l) => l.productId),
  }).fee;
  const after = orderTotals(lines, newShipping).total;
  const changes = lines
    .map((l) => ({ line: l, old: order.lines.find((o) => o.productId === l.productId)?.qty ?? 0 }))
    .filter((c) => c.old !== c.line.qty);

  const save = () => {
    updateOrder(orderId, {
      lines: lines.map(({ productId, name, qty, price }) => ({ productId, name, qty, price })),
      carrierId: carrier,
      roundDate: round,
      addressId: addressId ?? undefined,
    });
    notifyDone(
      order.status === 'factory_accepted' ? 'บันทึกการแก้ไขแล้ว · แจ้งเตือนโรงงานแล้ว' : 'บันทึกการแก้ไขแล้ว',
    );
    void navigate({ to: '/orders/$orderId', params: { orderId } });
  };

  const today = todayIso();
  const rounds = [...new Set([order.roundDate, ...roundChoices(db, today, 0, 4)])].toSorted();

  return (
    <Stack>
      <PageHeader
        title={`แก้ไข ${orderId}`}
        description={`${CHANNEL_LABEL_TH[order.channel]} · ${order.customerName}`}
        pending
        actions={
          <>
            <ButtonLink variant="default" to="/orders/$orderId" params={{ orderId }}>
              ยกเลิก
            </ButtonLink>
            <Button onClick={save} disabled={locked}>
              บันทึกการแก้ไข
            </Button>
          </>
        }
      />
      {locked ? (
        <Alert color="brand" variant="light">
          เลยเวลาแก้ไขแล้ว ({formatThaiDate(deadline, 'D MMM HH:mm')}) หรือ Order ไม่อยู่ในสถานะที่แก้ไขได้ ·
          ติดต่อหัวหน้าหรือ Admin
        </Alert>
      ) : (
        <Alert color="blue" variant="light">
          แก้ไขได้ถึง {formatThaiDate(deadline, 'D MMM BBBB HH:mm')} น. (20 ชั่วโมงหลังตัดรอบ) ·
          หลังจากนั้นระบบล็อกการแก้ไข{' '}
          <Badge size="xs" variant="outline">
            Q9
          </Badge>
        </Alert>
      )}
      {order.status === 'factory_accepted' && !locked && (
        <Alert color="brand" variant="light">
          โรงงานรับ Order นี้แล้ว · เมื่อบันทึก ระบบจะแจ้งเตือนโรงงานทันที
        </Alert>
      )}

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <SectionCard title="สินค้า">
              <LineItemsEditor
                lines={lines}
                onChange={(ls) =>
                  setLines(
                    ls.map((l) => {
                      // Edit keeps the price rules: quantity changes move the tier price
                      const tier = linePrice(
                        db,
                        l.productId,
                        order.channel,
                        l.qty,
                        customer?.priceGroup,
                      );
                      return { ...l, basePrice: tier, price: tier };
                    }),
                  )
                }
                products={products}
                editablePrice={false}
                disabled={locked}
              />
            </SectionCard>
            <SectionCard title="ที่อยู่และการจัดส่ง">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select
                  label="ที่อยู่จัดส่ง"
                  data={(customer?.addresses ?? []).map((a) => ({
                    value: a.id,
                    label: `${a.name} · ${a.text}`,
                  }))}
                  value={addressId}
                  onChange={setAddressId}
                  placeholder={order.address}
                  disabled={locked || marketplace}
                  style={{ gridColumn: '1 / -1' }}
                />
                <Select
                  label="ขนส่ง"
                  data={db.carriers.map((c) => ({ value: c.id, label: c.fullName }))}
                  value={carrier}
                  onChange={(v) => {
                    const next = db.carriers.find((c) => c.id === v);
                    if (next) setCarrier(next.id);
                  }}
                  disabled={locked}
                />
                <Select
                  label="รอบการส่ง"
                  data={rounds.map((d) => ({ value: d, label: roundText(d) }))}
                  value={round}
                  onChange={(v) => v && setRound(v)}
                  disabled={locked}
                />
              </SimpleGrid>
              {marketplace && (
                <Text size="xs" c="dimmed" mt="xs">
                  Order จาก Marketplace แก้ไขได้เฉพาะบาง field (รอยืนยัน Q9)
                </Text>
              )}
            </SectionCard>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SectionCard title="สรุปการเปลี่ยนแปลง">
            <Stack gap="xs">
              {changes.length === 0 && before === after && (
                <Text c="dimmed">ยังไม่มีการเปลี่ยนแปลง</Text>
              )}
              {changes.map((c) => (
                <ChangeRow
                  key={c.line.productId}
                  label={c.line.name}
                  from={String(c.old)}
                  to={String(c.line.qty)}
                />
              ))}
              {before !== after && (
                <ChangeRow label="ยอดรวม" from={formatBaht(before)} to={formatBaht(after)} />
              )}
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function ChangeRow({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Group gap={6}>
        <Text td="line-through" c="dimmed">
          {from}
        </Text>
        <Text>→</Text>
        <Text fw={700}>{to}</Text>
      </Group>
    </Paper>
  );
}
