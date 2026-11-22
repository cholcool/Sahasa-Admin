import { Button, Paper, Stack, Switch } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SimpleItemModal } from '@/features/master/components/SimpleItemModal';

/** 08-04 Sales channels (SRS 53) */
export const Route = createFileRoute('/_app/master/channels')({
  component: ChannelsPage,
});

interface ChannelRow {
  name: string;
  type: 'Marketplace' | 'Manual';
  api?: { label: string; color: string };
  needsPaymentCheck: boolean;
}

const CHANNELS: ChannelRow[] = [
  {
    name: 'Shopee',
    type: 'Marketplace',
    api: { label: 'Shopee API', color: 'green' },
    needsPaymentCheck: false,
  },
  {
    name: 'TikTok Shop',
    type: 'Marketplace',
    api: { label: 'รอเชื่อมต่อ', color: 'gray' },
    needsPaymentCheck: false,
  },
  {
    name: 'Lazada',
    type: 'Marketplace',
    api: { label: 'Lazada API', color: 'green' },
    needsPaymentCheck: false,
  },
  { name: 'Line', type: 'Manual', needsPaymentCheck: true },
  { name: 'Facebook', type: 'Manual', needsPaymentCheck: true },
  { name: 'หน้าร้าน', type: 'Manual', needsPaymentCheck: true },
  { name: 'โทร', type: 'Manual', needsPaymentCheck: true },
];

function ChannelsPage() {
  const [editing, setEditing] = useState<ChannelRow | 'new' | null>(null);
  const row = editing === 'new' ? undefined : (editing ?? undefined);

  return (
    <Stack>
      <PageHeader
        title="ช่องทางการขาย"
        description="รายการช่องทางที่ใช้รับ Order"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing('new')}>
            เพิ่ม
          </Button>
        }
      />
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="name"
          records={CHANNELS}
          columns={[
            { accessor: 'name', title: 'ช่องทาง' },
            {
              accessor: 'type',
              title: 'ประเภท',
              render: (r) => (
                <StatusBadge color={r.type === 'Marketplace' ? 'blue' : 'gold'}>
                  {r.type}
                </StatusBadge>
              ),
            },
            {
              accessor: 'api',
              title: 'เชื่อม API',
              render: (r) =>
                r.api ? <StatusBadge color={r.api.color}>{r.api.label}</StatusBadge> : '—',
            },
            {
              accessor: 'needsPaymentCheck',
              title: 'ต้องยืนยันรับเงิน',
              render: (r) => (r.needsPaymentCheck ? 'ต้อง' : 'ไม่ต้อง'),
            },
            {
              accessor: 'active',
              title: 'ใช้งาน',
              render: () => <Switch defaultChecked aria-label="ใช้งาน" />,
            },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (r) => (
                <Button size="compact-xs" variant="default" onClick={() => setEditing(r)}>
                  แก้ไข
                </Button>
              ),
            },
          ]}
        />
      </Paper>
      <SimpleItemModal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        name={row?.name}
        namePlaceholder="เช่น LINE MyShop"
        types={['Manual', 'Marketplace']}
        type={row?.type}
      />
    </Stack>
  );
}
