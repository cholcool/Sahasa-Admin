import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  CHANNELS,
  channelSchema,
  ORDER_STATUS_LABEL_TH,
  orderListQuerySchema,
  orderStatusSchema,
  type OrderStatus,
} from '@sahasa/shared';
import { IconFileUpload, IconPlus, IconSearch } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { AnchorLink } from '@/components/ui/links';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import {
  CARRIERS,
  CHANNEL_LABEL_TH,
  DELIVERY_STATE,
  PAYMENT_STATE,
} from '@/features/orders/labels';
import { MOCK_ORDERS, MOCK_STATUS_COUNTS, type OrderSummary } from '@/features/orders/mock-data';
import { formatBaht, formatNumber } from '@/lib/format';

/** 03-01 Order list (SRS 7, 16). Filters live in the URL, validated by the shared schema */
export const Route = createFileRoute('/_app/orders/')({
  validateSearch: orderListQuerySchema,
  component: OrderListPage,
});

const STATUS_TABS: (OrderStatus | 'all')[] = [
  'all',
  'pending_review',
  'confirmed',
  'factory_accepted',
  'shipped',
  'delivered',
  'cancelled',
];

function OrderListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [selected, setSelected] = useState<OrderSummary[]>([]);
  const [bulkOpened, bulk] = useDisclosure(false);

  const setSearch = (patch: Partial<typeof search>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }) });
  };

  // TODO: switch to useQuery(orderListQuery(search)) once the orders API returns data
  const records = useMemo(() => {
    const q = search.q?.toLowerCase();
    return MOCK_ORDERS.filter(
      (o) =>
        (!search.status || o.status === search.status) &&
        (!search.channel || o.channel === search.channel) &&
        (!q || o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)),
    );
  }, [search.q, search.status, search.channel]);

  const awaitingPayment = selected.filter((o) => o.payment === 'awaiting');

  return (
    <Stack>
      <PageHeader
        title={`Order ทั้งหมด ${formatNumber(MOCK_STATUS_COUNTS.all ?? 0)} รายการ`}
        description="รวมทุกช่องทางการขาย"
        actions={
          <>
            <Button
              variant="default"
              leftSection={<IconFileUpload size={16} />}
              component={Link}
              to="/orders/upload"
            >
              Upload Excel
            </Button>
            <Button leftSection={<IconPlus size={16} />} component={Link} to="/orders/new">
              สร้าง Order
            </Button>
          </>
        }
      />

      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={240}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเลข Order, ชื่อลูกค้า, เบอร์โทร"
              defaultValue={search.q}
              onBlur={(e) => setSearch({ q: e.currentTarget.value || undefined })}
            />
            <Select
              placeholder="ทุกช่องทาง"
              clearable
              data={CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL_TH[c] }))}
              value={search.channel ?? null}
              onChange={(v) => setSearch({ channel: channelSchema.safeParse(v).data })}
            />
            <Select placeholder="ทุกวันที่" clearable data={['วันนี้', '7 วันล่าสุด']} />
            <Select placeholder="ทุกรอบส่ง" clearable data={['13 พ.ย. 12:00', '14 พ.ย. 12:00']} />
            <Select placeholder="ทุกขนส่ง" clearable data={CARRIERS} />
          </Group>

          <Tabs
            value={search.status ?? 'all'}
            onChange={(v) => setSearch({ status: orderStatusSchema.safeParse(v).data })}
          >
            <Tabs.List>
              {STATUS_TABS.map((s) => (
                <Tabs.Tab
                  key={s}
                  value={s}
                  rightSection={
                    <Badge size="sm" variant="light" color="gray" radius="xl">
                      {MOCK_STATUS_COUNTS[s] ?? 0}
                    </Badge>
                  }
                >
                  {s === 'all' ? 'ทั้งหมด' : ORDER_STATUS_LABEL_TH[s]}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <Group justify="space-between">
            <Text size="sm">
              เลือก <b>{selected.length}</b> รายการ
            </Text>
            <Button color="gold" size="xs" disabled={selected.length === 0} onClick={bulk.open}>
              ยืนยันที่เลือก
            </Button>
          </Group>

          <DataTable
            withTableBorder
            borderRadius="md"
            highlightOnHover
            minHeight={240}
            idAccessor="orderNumber"
            records={records}
            selectedRecords={selected}
            onSelectedRecordsChange={setSelected}
            isRecordSelectable={(r) => r.status === 'pending_review'}
            noRecordsText="ไม่พบ Order"
            columns={[
              {
                accessor: 'orderNumber',
                title: 'เลข Order',
                render: (r) => (
                  <AnchorLink to="/orders/$orderId" params={{ orderId: r.orderNumber }} fw={600}>
                    {r.orderNumber}
                  </AnchorLink>
                ),
              },
              { accessor: 'channel', title: 'ช่องทาง', render: (r) => CHANNEL_LABEL_TH[r.channel] },
              { accessor: 'customerName', title: 'ลูกค้า' },
              {
                accessor: 'total',
                title: 'ยอดรวม (฿)',
                textAlign: 'right',
                render: (r) => formatNumber(r.total),
              },
              {
                accessor: 'payment',
                title: 'การรับเงิน',
                render: (r) => (
                  <StatusBadge color={PAYMENT_STATE[r.payment].color}>
                    {PAYMENT_STATE[r.payment].label}
                  </StatusBadge>
                ),
              },
              { accessor: 'round', title: 'รอบส่ง' },
              { accessor: 'carrier', title: 'ขนส่ง' },
              {
                accessor: 'delivery',
                title: 'การจัดส่ง',
                render: (r) =>
                  r.delivery === 'none' ? (
                    '—'
                  ) : (
                    <StatusBadge color={DELIVERY_STATE[r.delivery].color}>
                      {DELIVERY_STATE[r.delivery].label}
                    </StatusBadge>
                  ),
              },
              {
                accessor: 'status',
                title: 'สถานะ',
                render: (r) => (
                  <Stack gap={2}>
                    <OrderStatusBadge status={r.status} />
                    {r.cancelReason && (
                      <Text size="xs" c="dimmed">
                        {r.cancelReason}
                      </Text>
                    )}
                  </Stack>
                ),
              },
            ]}
          />
        </Stack>
      </Paper>

      <ConfirmModal
        opened={bulkOpened}
        onClose={bulk.close}
        title={`ยืนยัน ${selected.length} Order`}
        confirmLabel={`ยืนยัน ${selected.length} Order`}
        doneMessage={`ยืนยัน ${selected.length} Order แล้ว · เข้าคิวโรงงาน`}
        onConfirm={() => setSelected([])}
      >
        {selected.map((o) => (
          <Paper key={o.orderNumber} withBorder p="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text fw={600}>{o.orderNumber}</Text>
                <Text size="xs" c="dimmed">
                  {CHANNEL_LABEL_TH[o.channel]} · {o.customerName} · {formatBaht(o.total)}
                </Text>
              </div>
              <StatusBadge color={PAYMENT_STATE[o.payment].color}>
                {PAYMENT_STATE[o.payment].label}
              </StatusBadge>
            </Group>
          </Paper>
        ))}
        {awaitingPayment.length > 0 && (
          <Alert color="orange" variant="light">
            {awaitingPayment.map((o) => o.orderNumber).join(', ')} เป็น Order Manual ที่ยังไม่ยืนยันรับเงิน ·
            ต้องยืนยันรับเงินก่อนหรือไม่{' '}
            <Badge variant="outline" color="orange" size="xs">
              รอยืนยัน
            </Badge>
          </Alert>
        )}
        <Alert color="blue" variant="light">
          Order ที่ยืนยันแล้วจะเข้าคิวโรงงานรอบ 13 พ.ย. 12:00
        </Alert>
      </ConfirmModal>
    </Stack>
  );
}
