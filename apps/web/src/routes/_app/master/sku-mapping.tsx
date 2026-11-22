import { Button, Paper, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkuMatchModal, type UnmappedSku } from '@/features/platforms/components/SkuMatchModal';

/** 08-02 SKU mapping rules (SRS 51) */
export const Route = createFileRoute('/_app/master/sku-mapping')({
  component: SkuMappingPage,
});

const RULES = [
  {
    id: 1,
    product: 'PRD-001 เต้าหู้ แพ็ค 10',
    platform: 'Shopee',
    sku: 'TOFU-10',
    qty: '1 แพ็ค',
    lastUsed: '10:45',
  },
  {
    id: 2,
    product: 'PRD-001 เต้าหู้ แพ็ค 10',
    platform: 'Shopee',
    sku: 'TOFU-10-X2',
    qty: '2 แพ็ค',
    lastUsed: '09:12',
  },
  {
    id: 3,
    product: 'PRD-001 เต้าหู้ แพ็ค 10',
    platform: 'TikTok Shop',
    sku: '1729-TOFU10',
    qty: '1 แพ็ค',
    lastUsed: '08:40',
  },
  {
    id: 4,
    product: 'PRD-001 เต้าหู้ แพ็ค 10',
    platform: 'Lazada',
    sku: 'SHS-TF10',
    qty: '1 แพ็ค',
    lastUsed: 'เมื่อวาน',
  },
  {
    id: 5,
    product: 'PRD-002 น้ำจิ้ม 400g',
    platform: 'Shopee',
    sku: 'SAUCE-400',
    qty: '1 ขวด',
    lastUsed: '10:31',
  },
];

const NEW_RULE: UnmappedSku = {
  platform: 'Shopee',
  sku: 'TOFU-10-PROMO',
  name: 'เต้าหู้คลองแงะ 10 ชิ้น (โปรแพ็คคู่)',
  orders: 0,
};

function SkuMappingPage() {
  const [editing, setEditing] = useState<UnmappedSku | null>(null);
  return (
    <Stack>
      <PageHeader
        title="จับคู่ SKU"
        description="กฎแปลง SKU ของแต่ละ Platform เป็นรหัสสินค้าในระบบ"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing(NEW_RULE)}>
            เพิ่มกฎจับคู่
          </Button>
        }
      />
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          records={RULES}
          columns={[
            { accessor: 'product', title: 'สินค้าในระบบ' },
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
            { accessor: 'qty', title: 'จำนวนต่อ 1 SKU' },
            { accessor: 'lastUsed', title: 'ใช้ล่าสุด' },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (r) => (
                <Button
                  size="compact-xs"
                  variant="default"
                  onClick={() =>
                    setEditing({ platform: r.platform, sku: r.sku, name: r.product, orders: 0 })
                  }
                >
                  แก้ไข
                </Button>
              ),
            },
          ]}
        />
      </Paper>
      <SkuMatchModal sku={editing} onClose={() => setEditing(null)} />
    </Stack>
  );
}
