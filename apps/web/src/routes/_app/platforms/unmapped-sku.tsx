import { Alert, Button, Paper, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkuMatchModal, type UnmappedSku } from '@/features/platforms/components/SkuMatchModal';

/** 07-03 Unmapped platform SKUs (SRS 42, 43) */
export const Route = createFileRoute('/_app/platforms/unmapped-sku')({
  component: UnmappedSkuPage,
});

const ROWS: (UnmappedSku & { firstSeen: string })[] = [
  {
    platform: 'Shopee',
    sku: 'TOFU-10-PROMO',
    name: 'เต้าหู้คลองแงะ 10 ชิ้น (โปรแพ็คคู่)',
    orders: 4,
    firstSeen: '12 พ.ย. 14:20',
  },
  {
    platform: 'TikTok Shop',
    sku: 'SAUCE400-NEW',
    name: 'น้ำจิ้มสูตรเด็ด 400 กรัม',
    orders: 2,
    firstSeen: '13 พ.ย. 08:02',
  },
];

function UnmappedSkuPage() {
  const [matching, setMatching] = useState<UnmappedSku | null>(null);
  const affected = ROWS.reduce((s, r) => s + r.orders, 0);
  return (
    <Stack>
      <PageHeader
        title="SKU ที่จับคู่ไม่ได้"
        description="Order ที่มี SKU ไม่รู้จักจะติด flag และยังไม่เข้าคิวโรงงานจนกว่าจะจับคู่"
      />
      <Alert color="brand" variant="light">
        มี {ROWS.length} SKU ที่ยังไม่จับคู่ · กระทบ {affected} Order · แจ้ง Admin แล้ว
      </Alert>
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="sku"
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
            { accessor: 'orders', title: 'Order ที่ติด', textAlign: 'right' },
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
      <SkuMatchModal sku={matching} onClose={() => setMatching(null)} />
    </Stack>
  );
}
