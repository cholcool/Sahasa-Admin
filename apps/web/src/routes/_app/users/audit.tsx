import { Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { AnchorLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExportExcelButton } from '@/features/reports/components/ReportFilters';

/** 10-03 Audit log (SRS 62) */
export const Route = createFileRoute('/_app/users/audit')({
  component: AuditLogPage,
});

type Action = 'edit' | 'after_cutoff' | 'cancel' | 'confirm' | 'create';

const ACTION: Record<Action, { label: string; color: string }> = {
  edit: { label: 'แก้ไข', color: 'orange' },
  after_cutoff: { label: 'เพิ่มหลังตัดรอบ', color: 'blue' },
  cancel: { label: 'ยกเลิก', color: 'brand' },
  confirm: { label: 'ยืนยัน', color: 'green' },
  create: { label: 'สร้าง', color: 'gray' },
};

const LOGS = [
  {
    id: 1,
    at: '13 พ.ย. 10:42',
    user: 'Sales01',
    action: 'edit' as Action,
    doc: 'ORD-000128',
    field: 'จำนวนเต้าหู้',
    before: '4',
    after: '5',
  },
  {
    id: 2,
    at: '13 พ.ย. 10:15',
    user: 'หัวหน้า Sales',
    action: 'after_cutoff' as Action,
    doc: 'ORD-000150',
    field: 'รอบส่ง',
    before: '14 พ.ย. 12:00',
    after: '13 พ.ย. 12:00',
  },
  {
    id: 3,
    at: '13 พ.ย. 09:58',
    user: 'Admin',
    action: 'cancel' as Action,
    doc: 'ORD-000117',
    field: 'สถานะ',
    before: 'โรงงานรับแล้ว',
    after: 'ยกเลิก · ลูกค้าขอยกเลิก',
  },
  {
    id: 4,
    at: '13 พ.ย. 09:40',
    user: 'บัญชี01',
    action: 'confirm' as Action,
    doc: 'ORD-000141',
    field: 'การรับเงิน',
    before: 'รอยืนยัน',
    after: 'รับเงินแล้ว ฿1,259',
  },
  {
    id: 5,
    at: '13 พ.ย. 09:12',
    user: 'Sales01',
    action: 'create' as Action,
    doc: 'ORD-000141',
    field: undefined,
    before: undefined,
    after: 'ช่องทาง Line',
  },
];

function AuditLogPage() {
  const [action, setAction] = useState<string | null>(null);
  const rows = LOGS.filter((l) => !action || l.action === action);

  return (
    <Stack>
      <PageHeader
        title="Audit log"
        description="ประวัติผู้แก้ไข/ยกเลิก เวลา ค่าก่อนและหลัง"
        actions={<ExportExcelButton />}
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={220}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเลขเอกสารหรือผู้ใช้"
            />
            <Select
              placeholder="ทุกการกระทำ"
              clearable
              data={Object.entries(ACTION).map(([value, a]) => ({ value, label: a.label }))}
              value={action}
              onChange={setAction}
            />
            <Select data={['7 วันล่าสุด', 'วันนี้', '30 วัน']} defaultValue="7 วันล่าสุด" />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            records={rows}
            noRecordsText="ไม่มีรายการ"
            columns={[
              { accessor: 'at', title: 'เวลา' },
              { accessor: 'user', title: 'ผู้ใช้' },
              {
                accessor: 'action',
                title: 'การกระทำ',
                render: (r) => (
                  <StatusBadge color={ACTION[r.action].color}>{ACTION[r.action].label}</StatusBadge>
                ),
              },
              {
                accessor: 'doc',
                title: 'เอกสาร',
                render: (r) => (
                  <AnchorLink to="/orders/$orderId" params={{ orderId: r.doc }} size="sm" fw={600}>
                    {r.doc}
                  </AnchorLink>
                ),
              },
              { accessor: 'field', title: 'ฟิลด์', render: (r) => r.field ?? '—' },
              {
                accessor: 'before',
                title: 'ค่าเดิม',
                render: (r) =>
                  r.before ? (
                    <Text
                      size="sm"
                      c="dimmed"
                      td={r.action === 'edit' ? 'line-through' : undefined}
                    >
                      {r.before}
                    </Text>
                  ) : (
                    '—'
                  ),
              },
              {
                accessor: 'after',
                title: 'ค่าใหม่',
                render: (r) => (
                  <Text size="sm" fw={r.action === 'create' ? 400 : 700}>
                    {r.after}
                  </Text>
                ),
              },
            ]}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
