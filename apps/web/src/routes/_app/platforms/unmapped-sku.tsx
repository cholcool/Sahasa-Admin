import { Alert, Button, Paper, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { AnchorLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { resolveUnmappedSku } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import { SkuMatchModal, type UnmappedSku } from '@/features/platforms/components/SkuMatchModal';
import { formatThaiDate } from '@/lib/dayjs';

/** 07-03 Unmapped platform SKUs (SRS 42, 43) */
export const Route = createFileRoute('/_app/platforms/unmapped-sku')({
  component: UnmappedSkuPage,
});

function UnmappedSkuPage() {
  const db = useMockDb();
  const [matching, setMatching] = useState<UnmappedSku | null>(null);
  const ROWS = db.unmappedSkus.map((u) => ({
    id: u.id,
    platform: u.platform,
    sku: u.sku,
    name: u.name,
    orders: 1,
    orderNumber: u.orderNumber,
    firstSeen: formatThaiDate(u.at, 'D MMM HH:mm'),
  }));
  const affected = ROWS.reduce((s, r) => s + r.orders, 0);
  return (
    <Stack>
      <PageHeader
        title="SKU ที่จับคู่ไม่ได้"
        description="Order ที่มี SKU ไม่รู้จักจะติด flag และยังไม่เข้าคิวโรงงานจนกว่าจะจับคู่"
      />
      {ROWS.length > 0 ? (
        <Alert color="brand" variant="light">
          มี {ROWS.length} SKU ที่ยังไม่จับคู่ · กระทบ {affected} Order · แจ้ง Admin แล้ว
        </Alert>
      ) : (
        <Alert color="green" variant="light">
          จับคู่ SKU ครบแล้ว
        </Alert>
      )}
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="id"
          minHeight={160}
          noRecordsText="ไม่มี SKU ที่ค้างจับคู่"
          records={ROWS}
          columns={[
            { accessor: 'platform', title: 'Platform' },
            {
              accessor: 'sku',
              title: 'SKU ของ Platform',
              render: (r) => (
                <Text ff="monospace" size="sm">
                  {r.sku}
                </Text>
              ),
            },
            { accessor: 'name', title: 'ชื่อสินค้าใน Platform' },
            {
              accessor: 'orderNumber',
              title: 'Order ที่ติด',
              render: (r) => (
                <AnchorLink to="/orders/$orderId" params={{ orderId: r.orderNumber }} size="sm">
                  {r.orderNumber}
                </AnchorLink>
              ),
            },
            { accessor: 'firstSeen', title: 'พบครั้งแรก' },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (r) => (
                <Button size="compact-xs" onClick={() => setMatching(r)}>
                  จับคู่
                </Button>
              ),
            },
          ]}
        />
      </Paper>
      <SkuMatchModal
        sku={matching}
        onClose={() => setMatching(null)}
        onConfirm={(s) => s.id && resolveUnmappedSku(s.id)}
      />
    </Stack>
  );
}
