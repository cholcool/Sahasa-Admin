import { Badge, Button, Group, Paper, Select, Stack, Switch, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SimpleItemModal } from '@/features/master/components/SimpleItemModal';

/** 08-05 Carriers, API and label format (SRS 54) */
export const Route = createFileRoute('/_app/master/carriers')({
  component: CarriersPage,
});

interface CarrierRow {
  name: string;
  area?: string;
  api?: { label: string; color: string };
  label: string;
  labelPending: boolean;
  closing: string;
}

const CARRIERS: CarrierRow[] = [
  {
    name: 'Inter Express',
    area: 'หาดใหญ่',
    api: { label: 'เชื่อมแล้ว', color: 'green' },
    label: 'ฟอร์มระบบ',
    labelPending: true,
    closing: 'อัตโนมัติจาก API',
  },
  {
    name: 'Nim Express',
    area: 'กรุงเทพฯ',
    api: { label: 'เชื่อมแล้ว', color: 'green' },
    label: 'ฟอร์มระบบ',
    labelPending: true,
    closing: 'อัตโนมัติจาก API',
  },
  {
    name: 'Fuze Express',
    area: 'กรุงเทพฯ',
    api: { label: 'รอตั้งค่า', color: 'orange' },
    label: 'ฟอร์มระบบ',
    labelPending: true,
    closing: 'อัตโนมัติจาก API',
  },
  { name: 'ส่งจากหน้าร้าน', label: 'ไม่ใช้', labelPending: false, closing: 'กดยืนยันเอง' },
  { name: 'รถตู้/รถทัวร์', label: 'ฟอร์มระบบ', labelPending: false, closing: 'กดยืนยันเอง' },
];

function CarriersPage() {
  const [editing, setEditing] = useState<CarrierRow | 'new' | null>(null);
  const row = editing === 'new' ? undefined : (editing ?? undefined);

  return (
    <Stack>
      <PageHeader
        title="ขนส่ง"
        description="รายการขนส่ง พื้นที่ API และรูปแบบใบปะหน้า"
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
          records={CARRIERS}
          columns={[
            { accessor: 'name', title: 'ขนส่ง' },
            { accessor: 'area', title: 'พื้นที่', render: (r) => r.area ?? '—' },
            {
              accessor: 'api',
              title: 'API',
              render: (r) =>
                r.api ? <StatusBadge color={r.api.color}>{r.api.label}</StatusBadge> : '—',
            },
            {
              accessor: 'label',
              title: 'ใบปะหน้า Order Manual',
              render: (r) => (
                <Group gap={6}>
                  {r.label}
                  {r.labelPending && (
                    <Badge size="xs" variant="outline" color="orange">
                      รอยืนยัน
                    </Badge>
                  )}
                </Group>
              ),
            },
            { accessor: 'closing', title: 'ปิดงานส่งสำเร็จ' },
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
        namePlaceholder="เช่น Kerry Express"
      >
        <TextInput key={row?.area} label="พื้นที่" defaultValue={row?.area} placeholder="เช่น หาดใหญ่" />
        <Select
          label="ใบปะหน้า Order Manual"
          data={['ฟอร์มระบบ', 'ไม่ใช้']}
          defaultValue={row?.label ?? 'ฟอร์มระบบ'}
        />
        <Select
          label="ปิดงานส่งสำเร็จ"
          data={['อัตโนมัติจาก API', 'กดยืนยันเอง']}
          defaultValue={row?.closing ?? 'อัตโนมัติจาก API'}
        />
      </SimpleItemModal>
    </Stack>
  );
}
