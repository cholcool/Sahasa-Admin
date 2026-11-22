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
  TextInput,
} from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { LineItemsEditor, type EditableLine } from '@/features/orders/components/LineItemsEditor';
import { CARRIERS } from '@/features/orders/labels';
import { MOCK_ORDER_DETAIL, MOCK_PRODUCTS, ROUNDS } from '@/features/orders/mock-data';
import { orderTotals } from '@/features/orders/order-math';
import { formatBaht } from '@/lib/format';
import { notifyDone } from '@/lib/notify';

/** 03-05 Edit order (SRS 17, pending client confirmation) */
export const Route = createFileRoute('/_app/orders/$orderId/edit')({
  component: EditOrderPage,
});

// Quantities before this edit session (prototype shows tofu 4 → 5)
const ORIGINAL_LINES = MOCK_ORDER_DETAIL.lines.map((l, i) => ({ ...l, qty: i === 0 ? 4 : l.qty }));

function toEditable(lines: typeof MOCK_ORDER_DETAIL.lines): EditableLine[] {
  return lines.map((l) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === l.productId);
    return { ...l, unit: product?.unit ?? '', basePrice: product?.price ?? l.price };
  });
}

function EditOrderPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const [lines, setLines] = useState(() => toEditable(MOCK_ORDER_DETAIL.lines));
  const before = orderTotals(ORIGINAL_LINES, MOCK_ORDER_DETAIL.shippingFee).total;
  const after = orderTotals(lines, MOCK_ORDER_DETAIL.shippingFee).total;

  const changes = lines
    .map((l) => ({
      line: l,
      old: ORIGINAL_LINES.find((o) => o.productId === l.productId)?.qty ?? 0,
    }))
    .filter((c) => c.old !== c.line.qty);

  const save = () => {
    notifyDone('บันทึกการแก้ไขแล้ว · แจ้งเตือนโรงงานแล้ว');
    void navigate({ to: '/orders/$orderId', params: { orderId } });
  };

  return (
    <Stack>
      <PageHeader
        title={`แก้ไข ${orderId}`}
        description="Line · ร้านเจ๊หมวย"
        pending
        actions={
          <>
            <ButtonLink variant="default" to="/orders/$orderId" params={{ orderId }}>
              ยกเลิก
            </ButtonLink>
            <Button onClick={save}>บันทึกการแก้ไข</Button>
          </>
        }
      />
      <Alert color="blue" variant="light">
        แก้ไขได้ถึง 14 พ.ย. 2569 08:00 น. (20 ชั่วโมงหลังตัดรอบ) · หลังจากนั้นระบบล็อกการแก้ไข{' '}
        <Badge size="xs" variant="outline">
          Q9
        </Badge>
      </Alert>
      <Alert color="brand" variant="light">
        โรงงานรับ Order นี้แล้ว · เมื่อบันทึก ระบบจะแจ้งเตือนโรงงานทันที
      </Alert>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <SectionCard title="สินค้า">
              <LineItemsEditor
                lines={lines}
                onChange={setLines}
                products={MOCK_PRODUCTS}
                editablePrice={false}
              />
            </SectionCard>
            <SectionCard title="ที่อยู่และการจัดส่ง">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select
                  label="ที่อยู่จัดส่ง"
                  data={['เจ๊หมวย (หน้าร้าน) · หาดใหญ่', 'คุณต้น (สาขา 2) · คอหงส์']}
                  defaultValue="เจ๊หมวย (หน้าร้าน) · หาดใหญ่"
                  style={{ gridColumn: '1 / -1' }}
                />
                <Select label="ขนส่ง" data={CARRIERS.slice(0, 3)} defaultValue={CARRIERS[1]} />
                <Select label="รอบการส่ง" data={ROUNDS.slice(0, 2)} defaultValue={ROUNDS[0]} />
              </SimpleGrid>
              <Text size="xs" c="dimmed" mt="xs">
                Order จาก Marketplace แก้ไขได้เฉพาะบาง field (รอยืนยัน Q9)
              </Text>
            </SectionCard>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <SectionCard title="สรุปการเปลี่ยนแปลง">
              <Stack gap="xs">
                {changes.length === 0 && <Text c="dimmed">ยังไม่มีการเปลี่ยนแปลง</Text>}
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
            <SectionCard title="เมื่อเลยเวลาแก้ไข">
              <Stack gap="sm">
                <Alert color="brand" variant="light">
                  เลยเวลาแก้ไขแล้ว (14 พ.ย. 08:00) · ติดต่อหัวหน้าหรือ Admin
                </Alert>
                <TextInput label="จำนวน" value="5" disabled readOnly />
                <Text size="xs" c="dimmed">
                  ตัวอย่างสถานะล็อก: ช่องข้อมูลแก้ไขไม่ได้ และปุ่มบันทึกถูกปิด
                </Text>
              </Stack>
            </SectionCard>
          </Stack>
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
