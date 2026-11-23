import { Alert, Button, Divider, Grid, Group, Stack, Table, Text, Timeline } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ButtonLink } from '@/components/ui/links';
import { KeyValue } from '@/components/ui/KeyValue';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cancelOrder, confirmOrders, confirmPayment } from '@/features/mock/actions';
import { carrierName, documentFor, findOrder, roundText } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { CancelOrderModal, ConfirmPaymentModal } from '@/features/orders/components/OrderModals';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderStatusStepper } from '@/features/orders/components/OrderStatusStepper';
import { SlipThumbnails } from '@/features/orders/components/SlipThumbnails';
import { CHANNEL_LABEL_TH, DELIVERY_STATE, PAYMENT_STATE } from '@/features/orders/labels';
import { lineTotal, orderTotals } from '@/features/orders/order-math';
import { formatThaiDate } from '@/lib/dayjs';
import { formatBaht, formatNumber } from '@/lib/format';
import { notifyDone } from '@/lib/notify';

/** 03-04 Order detail (SRS 8, 9, 15) */
export const Route = createFileRoute('/_app/orders/$orderId/')({
  component: OrderDetailPage,
});

const PAYMENT_METHOD_TH = { platform: 'ชำระผ่าน Platform', transfer: 'โอน', cash: 'เงินสด' };

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const db = useMockDb();
  const order = findOrder(db, orderId);
  const [cancelOpened, cancel] = useDisclosure(false);
  const [payOpened, pay] = useDisclosure(false);

  if (!order) {
    return (
      <Stack>
        <PageHeader title={orderId} />
        <Alert color="orange" variant="light">
          ไม่พบ Order นี้ในข้อมูล Mockup ชุดปัจจุบัน (อาจสร้างข้อมูลใหม่หรือล้างข้อมูลไปแล้ว)
        </Alert>
        <ButtonLink variant="default" to="/orders" w="fit-content">
          กลับไปรายการ Order
        </ButtonLink>
      </Stack>
    );
  }

  const totals = orderTotals(order.lines, order.shippingFee);
  const doc = documentFor(db, order.orderNumber);
  const open = !['cancelled', 'delivered', 'shipped', 'partially_shipped'].includes(order.status);
  const editable = ['pending_review', 'confirmed', 'factory_accepted'].includes(order.status);
  const history = [...order.history].toReversed();
  const short = order.lines.some((l) => l.shippedQty !== undefined && l.shippedQty < l.qty);

  return (
    <Stack>
      <PageHeader
        title={order.orderNumber}
        description={`สร้างโดย ${order.createdBy} · ${formatThaiDate(order.orderedAt, 'D MMM BBBB HH:mm')}`}
        actions={
          <>
            {open && (
              <Button variant="default" onClick={cancel.open}>
                ยกเลิก Order
              </Button>
            )}
            {editable && (
              <ButtonLink variant="default" to="/orders/$orderId/edit" params={{ orderId }}>
                แก้ไข
              </ButtonLink>
            )}
            {order.status === 'pending_review' && (
              <Button
                onClick={() => {
                  confirmOrders([order.orderNumber]);
                  notifyDone(`ยืนยัน ${order.orderNumber} แล้ว · เข้าคิวโรงงาน`);
                }}
              >
                ยืนยัน Order
              </Button>
            )}
          </>
        }
      />
      <Group gap="xs" mt={-8}>
        <OrderStatusBadge status={order.status} />
        <StatusBadge>{CHANNEL_LABEL_TH[order.channel]}</StatusBadge>
        {order.platformOrderNo && <StatusBadge color="gray">{order.platformOrderNo}</StatusBadge>}
        {order.insertedAfterCutoff && <StatusBadge color="orange">แทรกหลังตัดรอบ</StatusBadge>}
        {order.editedAfterAccept && <StatusBadge color="brand">แก้ไขหลังโรงงานรับ</StatusBadge>}
      </Group>
      {order.status === 'cancelled' ? (
        <Alert color="brand" variant="light">
          ยกเลิกแล้ว · {order.cancelReason}
          {order.cancelledAt && ` · ${formatThaiDate(order.cancelledAt, 'D MMM BBBB HH:mm')}`}
        </Alert>
      ) : (
        <OrderStatusStepper status={order.status} />
      )}

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
                      {short && <Table.Th ta="right">ส่งจริง</Table.Th>}
                      <Table.Th ta="right">ราคา</Table.Th>
                      <Table.Th ta="right">รวม (฿)</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {order.lines.map((l) => (
                      <Table.Tr key={l.productId}>
                        <Table.Td>{l.name}</Table.Td>
                        <Table.Td ta="right">{l.qty}</Table.Td>
                        {short && (
                          <Table.Td
                            ta="right"
                            c={
                              l.shippedQty !== undefined && l.shippedQty < l.qty
                                ? 'orange'
                                : undefined
                            }
                          >
                            {l.shippedQty ?? l.qty}
                          </Table.Td>
                        )}
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
                {history.map((h) => (
                  <Timeline.Item key={h.at + h.text}>
                    <Text size="xs" c="dimmed">
                      {formatThaiDate(h.at, 'D MMM HH:mm')} · {h.by}
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
                  <Text fw={600}>{order.customerName}</Text>
                  <Text size="xs" c="dimmed">
                    {order.phone}
                  </Text>
                </div>
                <Text size="sm">{order.address}</Text>
                <KeyValue label="ประเภทการออกบิล">{order.billing}</KeyValue>
                <KeyValue label="เอกสารบัญชี">{doc ? doc.no : '—'}</KeyValue>
              </Stack>
            </SectionCard>

            <SectionCard title="การชำระเงิน">
              <Stack gap="sm">
                <KeyValue label="วิธีชำระ">{PAYMENT_METHOD_TH[order.paymentMethod]}</KeyValue>
                <KeyValue label="สถานะ">
                  <StatusBadge color={PAYMENT_STATE[order.payment].color}>
                    {PAYMENT_STATE[order.payment].label}
                  </StatusBadge>
                </KeyValue>
                {order.paymentMethod === 'transfer' && (
                  <SlipThumbnails count={order.payment === 'paid' ? 1 : 0} />
                )}
                {order.payment === 'awaiting' && order.status !== 'cancelled' && (
                  <Button color="gold" fullWidth onClick={pay.open}>
                    ยืนยันการรับเงิน
                  </Button>
                )}
              </Stack>
            </SectionCard>

            <SectionCard title="การจัดส่ง">
              <Stack gap={6}>
                <KeyValue label="ขนส่ง">{carrierName(order.carrierId, true)}</KeyValue>
                <KeyValue label="รอบการส่ง">{roundText(order.roundDate)}</KeyValue>
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
        key={`c-${order.orderNumber}`}
        opened={cancelOpened}
        onClose={cancel.close}
        order={order}
        onConfirm={(reason, note) => cancelOrder(order.orderNumber, reason, note)}
      />
      <ConfirmPaymentModal
        key={`p-${order.orderNumber}`}
        opened={payOpened}
        onClose={pay.close}
        order={order}
        onConfirm={(method, amount) => confirmPayment(order.orderNumber, method, amount)}
      />
    </Stack>
  );
}
