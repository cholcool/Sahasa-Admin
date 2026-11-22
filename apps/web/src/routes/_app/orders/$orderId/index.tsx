import { Button, Divider, Grid, Group, Stack, Table, Text, Timeline } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ButtonLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KeyValue } from '@/components/ui/KeyValue';
import { CancelOrderModal, ConfirmPaymentModal } from '@/features/orders/components/OrderModals';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderStatusStepper } from '@/features/orders/components/OrderStatusStepper';
import { SlipThumbnails } from '@/features/orders/components/SlipThumbnails';
import { CHANNEL_LABEL_TH, DELIVERY_STATE, PAYMENT_STATE } from '@/features/orders/labels';
import { MOCK_ORDER_DETAIL } from '@/features/orders/mock-data';
import { lineTotal, orderTotals } from '@/features/orders/order-math';
import { formatBaht, formatNumber } from '@/lib/format';
import { notifyDone } from '@/lib/notify';

/** 03-04 Order detail (SRS 8, 9, 15) */
export const Route = createFileRoute('/_app/orders/$orderId/')({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  // TODO: load by orderId from the API; mock always shows ORD-000141's content
  const order = { ...MOCK_ORDER_DETAIL, orderNumber: orderId };
  const totals = orderTotals(order.lines, order.shippingFee);
  const [cancelOpened, cancel] = useDisclosure(false);
  const [payOpened, pay] = useDisclosure(false);

  return (
    <Stack>
      <PageHeader
        title={order.orderNumber}
        description={`สร้างโดย ${order.createdBy} · ${order.createdAt}`}
        actions={
          <>
            <Button variant="default" onClick={cancel.open}>
              ยกเลิก Order
            </Button>
            <ButtonLink variant="default" to="/orders/$orderId/edit" params={{ orderId }}>
              แก้ไข
            </ButtonLink>
            <Button onClick={() => notifyDone(`ยืนยัน ${order.orderNumber} แล้ว · เข้าคิวโรงงาน`)}>
              ยืนยัน Order
            </Button>
          </>
        }
      />
      <Group gap="xs" mt={-8}>
        <OrderStatusBadge status={order.status} />
        <StatusBadge>{CHANNEL_LABEL_TH[order.channel]}</StatusBadge>
      </Group>
      <OrderStatusStepper status={order.status} />

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <SectionCard title="รายการสินค้า">
              <Table.ScrollContainer minWidth={420}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>สินค้า</Table.Th>
                      <Table.Th ta="right">จำนวน</Table.Th>
                      <Table.Th ta="right">ราคา</Table.Th>
                      <Table.Th ta="right">รวม (฿)</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {order.lines.map((l) => (
                      <Table.Tr key={l.productId}>
                        <Table.Td>{l.name}</Table.Td>
                        <Table.Td ta="right">{l.qty}</Table.Td>
                        <Table.Td ta="right">{formatNumber(l.price)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(lineTotal(l))}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
              <Stack gap={6} mt="md">
                <KeyValue label="ยอดสินค้า">{formatBaht(totals.items)}</KeyValue>
                <KeyValue label="ค่าส่ง">{formatBaht(totals.shipping)}</KeyValue>
                <Divider />
                <KeyValue label="ยอดรวม">
                  <b>{formatBaht(totals.total)}</b>
                </KeyValue>
              </Stack>
            </SectionCard>

            <SectionCard
              title="ประวัติการแก้ไข"
              actions={
                <Button size="xs" variant="subtle" component={Link} to="/users/audit">
                  ดู Audit log
                </Button>
              }
            >
              <Timeline bulletSize={12} lineWidth={2}>
                {order.history.map((h) => (
                  <Timeline.Item key={h.at + h.text}>
                    <Text size="xs" c="dimmed">
                      {h.at}
                    </Text>
                    <Text size="sm">{h.text}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <SectionCard title="ลูกค้าและที่อยู่จัดส่ง">
              <Stack gap={6}>
                <div>
                  <Text fw={600}>{order.customer.name}</Text>
                  <Text size="xs" c="dimmed">
                    {order.customer.phone}
                  </Text>
                </div>
                <Text size="sm">{order.address}</Text>
                <KeyValue label="ประเภทการออกบิล">{order.billing}</KeyValue>
              </Stack>
            </SectionCard>

            <SectionCard title="การชำระเงิน">
              <Stack gap="sm">
                <KeyValue label="วิธีชำระ">{order.paymentMethod}</KeyValue>
                <KeyValue label="สถานะ">
                  <StatusBadge color={PAYMENT_STATE[order.payment].color}>
                    {PAYMENT_STATE[order.payment].label}
                  </StatusBadge>
                </KeyValue>
                <SlipThumbnails count={2} />
                {order.payment === 'awaiting' && (
                  <Button color="gold" fullWidth onClick={pay.open}>
                    ยืนยันการรับเงิน
                  </Button>
                )}
              </Stack>
            </SectionCard>

            <SectionCard title="การจัดส่ง">
              <Stack gap={6}>
                <KeyValue label="ขนส่ง">{order.carrier}</KeyValue>
                <KeyValue label="รอบการส่ง">{order.round}</KeyValue>
                <KeyValue label="เลข Tracking">{order.tracking ?? '—'}</KeyValue>
                <KeyValue label="สถานะการจัดส่ง">
                  <StatusBadge color={DELIVERY_STATE[order.delivery].color}>
                    {DELIVERY_STATE[order.delivery].label}
                  </StatusBadge>
                </KeyValue>
              </Stack>
            </SectionCard>
          </Stack>
        </Grid.Col>
      </Grid>

      <CancelOrderModal
        opened={cancelOpened}
        onClose={cancel.close}
        orderNumber={order.orderNumber}
      />
      <ConfirmPaymentModal
        opened={payOpened}
        onClose={pay.close}
        orderNumber={order.orderNumber}
        amountDue={totals.total}
      />
    </Stack>
  );
}
