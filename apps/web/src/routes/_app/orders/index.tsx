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
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconFileUpload,
  IconFilterOff,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { AnchorLink } from '@/components/ui/links';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { CHANNEL_LABEL_TH, DELIVERY_STATE, PAYMENT_STATE } from '@/features/orders/labels';
import { filterOrders } from '@/features/orders/filter-orders';
import { confirmOrders } from '@/features/mock/actions';
import { carrierName, roundChoices, roundLabel, statusCounts } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import type { MockOrder } from '@/features/mock/types';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';
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
  'partially_shipped',
  'shipped',
  'delivered',
  'cancelled',
];

function OrderListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [selected, setSelected] = useState<MockOrder[]>([]);
  const [round, setRound] = useState<string | null>(null);
  const [carrier, setCarrier] = useState<string | null>(null);
  const db = useMockDb();
  const [bulkOpened, bulk] = useDisclosure(false);

  const setSearch = (patch: Partial<typeof search>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }) });
  };

  // TODO: switch to useQuery(orderListQuery(search)) once the orders API returns data
  const { records, counts } = useMemo(() => {
    const extra = db.orders.filter(
      (o) => (!round || o.roundDate === round) && (!carrier || o.carrierId === carrier),
    );
    const matched = filterOrders(extra, { ...search, status: undefined });
    return {
      counts: statusCounts(matched),
      records: (search.status
        ? matched.filter((o) => o.status === search.status)
        : matched
      ).toSorted((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
    };
  }, [db.orders, search, round, carrier]);
  const pageRecords = records.slice(
    (search.page - 1) * search.pageSize,
    search.page * search.pageSize,
  );

  const hasFilter = Boolean(
    search.q ||
    search.channel ||
    search.status ||
    search.orderDateFrom ||
    search.orderDateTo ||
    round ||
    carrier,
  );
  const today = todayIso();
  const yesterday = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');

  const awaitingPayment = selected.filter((o) => o.payment === 'awaiting');

  return (
    <Stack>
      <PageHeader
        title={`Order ทั้งหมด ${formatNumber(db.orders.length)} รายการ`}
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
              key={`q-${search.q ?? ''}`}
              miw={240}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเลข Order, ชื่อลูกค้า, เบอร์โทร"
              aria-label="ค้นหา Order"
              defaultValue={search.q}
              onBlur={(e) => setSearch({ q: e.currentTarget.value || undefined })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSearch({ q: e.currentTarget.value || undefined });
              }}
            />
            <Select
              placeholder="ทุกช่องทาง"
              aria-label="ช่องทางการขาย"
              clearable
              data={CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL_TH[c] }))}
              value={search.channel ?? null}
              onChange={(v) => setSearch({ channel: channelSchema.safeParse(v).data })}
            />
            {/* Uncommitted first click lives inside the picker; the URL changes only on a full range */}
            <DatePickerInput
              key={`d-${search.orderDateFrom ?? ''}-${search.orderDateTo ?? ''}`}
              type="range"
              allowSingleDateInRange
              miw={220}
              placeholder="ทุกวันที่สั่ง"
              aria-label="วันที่สั่ง"
              leftSection={<IconCalendar size={16} />}
              clearable
              valueFormat="D MMM BBBB"
              monthLabelFormat="MMMM BBBB"
              yearLabelFormat="BBBB"
              defaultValue={[search.orderDateFrom ?? null, search.orderDateTo ?? null]}
              presets={[
                { value: [today, today], label: 'วันนี้' },
                { value: [yesterday, yesterday], label: 'เมื่อวาน' },
                {
                  value: [dayjs(today).subtract(6, 'day').format('YYYY-MM-DD'), today],
                  label: '7 วันล่าสุด',
                },
                {
                  value: [dayjs(today).startOf('month').format('YYYY-MM-DD'), today],
                  label: 'เดือนนี้',
                },
              ]}
              onChange={([from, to]) => {
                if (from && to) setSearch({ orderDateFrom: from, orderDateTo: to });
                else if (!from && !to)
                  setSearch({ orderDateFrom: undefined, orderDateTo: undefined });
              }}
            />
            <Select
              placeholder="ทุกรอบส่ง"
              aria-label="รอบส่ง"
              clearable
              data={roundChoices(db, today, 3, 4).map((d) => ({
                value: d,
                label: `${roundLabel(d, today)} 12:00`,
              }))}
              value={round}
              onChange={(v) => {
                setRound(v);
                setSearch({});
              }}
            />
            <Select
              placeholder="ทุกขนส่ง"
              aria-label="ขนส่ง"
              clearable
              data={db.carriers.map((c) => ({ value: c.id, label: c.fullName }))}
              value={carrier}
              onChange={(v) => {
                setCarrier(v);
                setSearch({});
              }}
            />
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
                      {counts[s]}
                    </Badge>
                  }
                >
                  {s === 'all' ? 'ทั้งหมด' : ORDER_STATUS_LABEL_TH[s]}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <Group justify="space-between">
            <Group gap="xs">
              <Text size="sm">
                พบ <b>{formatNumber(records.length)}</b> รายการ · เลือก <b>{selected.length}</b>{' '}
                รายการ
              </Text>
              {hasFilter && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  leftSection={<IconFilterOff size={14} />}
                  onClick={() => {
                    setRound(null);
                    setCarrier(null);
                    setSearch({
                      q: undefined,
                      channel: undefined,
                      status: undefined,
                      orderDateFrom: undefined,
                      orderDateTo: undefined,
                    });
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </Group>
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
            records={pageRecords}
            totalRecords={records.length}
            recordsPerPage={search.pageSize}
            page={search.page}
            onPageChange={(p) => setSearch({ page: p })}
            recordsPerPageOptions={[20, 50, 100, 200]}
            onRecordsPerPageChange={(n) => setSearch({ pageSize: n })}
            recordsPerPageLabel="ต่อหน้า"
            paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
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
              {
                accessor: 'orderDate',
                title: 'วันที่สั่ง',
                render: (r) => formatThaiDate(r.orderDate),
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
              {
                accessor: 'roundDate',
                title: 'รอบส่ง',
                render: (r) => roundLabel(r.roundDate, today),
              },
              {
                accessor: 'carrierId',
                title: 'ขนส่ง',
                render: (r) => carrierName(r.carrierId),
              },
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
        onConfirm={() => {
          confirmOrders(selected.map((o) => o.orderNumber));
          setSelected([]);
        }}
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
          Order ที่ยืนยันแล้วจะเข้าคิวโรงงานตามรอบส่งของแต่ละ Order
        </Alert>
      </ConfirmModal>
    </Stack>
  );
}
