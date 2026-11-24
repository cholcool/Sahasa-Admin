import { Group, Select, Stack, TextInput, Title } from '@mantine/core';
import {
  CHANNELS,
  ORDER_STATUS_LABEL_TH,
  ORDER_STATUSES,
  orderListQuerySchema,
} from '@sahasa/shared';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { orderListQuery } from '@/features/orders/api';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { formatThaiDate } from '@/lib/dayjs';

/** filter ทั้งหมดอยู่ใน URL เช่น /orders?status=awaiting_confirm&page=2 (ตรวจด้วย schema เดียวกับ API) */
export const Route = createFileRoute('/_app/orders/')({
  validateSearch: orderListQuerySchema,
  component: OrderListPage,
});

function OrderListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isFetching } = useQuery(orderListQuery(search));

  const setSearch = (patch: Partial<typeof search>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }) });
  };

  return (
    <Stack>
      <Title order={2}>ออเดอร์</Title>
      <Group>
        <TextInput
          placeholder="ค้นหาเลขออเดอร์ / ชื่อ / เบอร์"
          defaultValue={search.q}
          onBlur={(e) => setSearch({ q: e.currentTarget.value || undefined })}
        />
        <Select
          placeholder="สถานะ"
          clearable
          data={ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL_TH[s] }))}
          value={search.status ?? null}
          onChange={(v) => setSearch({ status: v ?? undefined })}
        />
        <Select
          placeholder="ช่องทาง"
          clearable
          data={[...CHANNELS]}
          value={search.channel ?? null}
          onChange={(v) => setSearch({ channel: v ?? undefined })}
        />
      </Group>
      <DataTable
        withTableBorder
        minHeight={240}
        fetching={isFetching}
        records={data?.items ?? []}
        totalRecords={data?.total ?? 0}
        recordsPerPage={search.pageSize}
        page={search.page}
        onPageChange={(page) => setSearch({ page })}
        noRecordsText="ยังไม่มีออเดอร์"
        columns={[
          { accessor: 'orderNumber', title: 'เลขที่' },
          { accessor: 'customerName', title: 'ลูกค้า' },
          {
            accessor: 'status',
            title: 'สถานะ',
            render: (r) => <OrderStatusBadge status={r.status} />,
          },
          { accessor: 'shipDate', title: 'วันส่ง', render: (r) => formatThaiDate(r.shipDate) },
          { accessor: 'total', title: 'ยอด', textAlign: 'right' },
        ]}
      />
    </Stack>
  );
}
