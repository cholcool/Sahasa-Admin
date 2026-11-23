import { Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { AnchorLink } from '@/components/ui/links';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { nowThai } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import type { OrderEventType } from '@/features/mock/types';
import { ExportExcelButton } from '@/features/reports/components/ReportFilters';
import { dayjs, formatThaiDate } from '@/lib/dayjs';

/** 10-03 Audit log (SRS 62) — built from every order's history */
export const Route = createFileRoute('/_app/users/audit')({
  component: AuditLogPage,
});

type Action = 'edit' | 'after_cutoff' | 'cancel' | 'confirm' | 'create' | 'status';

const ACTION: Record<Action, { label: string; color: string }> = {
  create: { label: 'สร้าง', color: 'gray' },
  edit: { label: 'แก้ไข', color: 'orange' },
  after_cutoff: { label: 'เพิ่มหลังตัดรอบ', color: 'blue' },
  confirm: { label: 'ยืนยัน', color: 'green' },
  status: { label: 'อัปเดตสถานะ', color: 'blue' },
  cancel: { label: 'ยกเลิก', color: 'brand' },
};

const ACTION_OF: Record<OrderEventType, Action> = {
  created: 'create',
  edited: 'edit',
  payment: 'confirm',
  confirmed: 'confirm',
  accepted: 'status',
  shipped: 'status',
  delivered: 'status',
  short: 'status',
  invoiced: 'status',
  cancelled: 'cancel',
};

const PERIODS = [
  { value: '1', label: 'วันนี้' },
  { value: '7', label: '7 วันล่าสุด' },
  { value: '30', label: '30 วัน' },
  { value: 'all', label: 'ทั้งหมด' },
];

const PAGE_SIZE = 30;

function AuditLogPage() {
  const db = useMockDb();
  const [action, setAction] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>('7');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const now = nowThai();

  const all = useMemo(
    () =>
      db.orders
        .flatMap((o) =>
          o.history.map((h, i) => ({
            id: `${o.orderNumber}-${i}`,
            at: h.at,
            user: h.by,
            action:
              h.type === 'created' && o.insertedAfterCutoff
                ? ('after_cutoff' as const)
                : ACTION_OF[h.type],
            doc: o.orderNumber,
            detail: h.text,
          })),
        )
        .toSorted((a, b) => b.at.localeCompare(a.at)),
    [db.orders],
  );

  const since =
    period === 'all'
      ? ''
      : dayjs(now)
          .subtract(Number(period) - 1, 'day')
          .startOf('day')
          .format();
  const query = q.trim().toLowerCase();
  const rows = all.filter(
    (l) =>
      l.at <= now &&
      (!since || dayjs(l.at).isAfter(since)) &&
      (!action || l.action === action) &&
      (!query || l.doc.toLowerCase().includes(query) || l.user.toLowerCase().includes(query)),
  );
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const reset = () => setPage(1);

  return (
    <Stack>
      <PageHeader
        title="Audit log"
        description="ประวัติผู้สร้าง/แก้ไข/ยกเลิก และการเปลี่ยนสถานะ พร้อมเวลา"
        actions={
          <ExportExcelButton
            filename="audit-log"
            rows={() =>
              rows.map((r) => ({
                เวลา: formatThaiDate(r.at, 'D MMM BBBB HH:mm'),
                ผู้ใช้: r.user,
                การกระทำ: ACTION[r.action].label,
                เอกสาร: r.doc,
                รายละเอียด: r.detail,
              }))
            }
          />
        }
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={220}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาเลขเอกสารหรือผู้ใช้"
              value={q}
              onChange={(e) => {
                setQ(e.currentTarget.value);
                reset();
              }}
            />
            <Select
              placeholder="ทุกการกระทำ"
              clearable
              data={Object.entries(ACTION).map(([value, a]) => ({ value, label: a.label }))}
              value={action}
              onChange={(v) => {
                setAction(v);
                reset();
              }}
            />
            <Select
              aria-label="ช่วงเวลา"
              data={PERIODS}
              value={period}
              onChange={(v) => {
                setPeriod(v);
                reset();
              }}
              allowDeselect={false}
            />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            minHeight={200}
            idAccessor="id"
            records={pageRows}
            totalRecords={rows.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
            noRecordsText="ไม่มีรายการ"
            columns={[
              { accessor: 'at', title: 'เวลา', render: (r) => formatThaiDate(r.at, 'D MMM HH:mm') },
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
              {
                accessor: 'detail',
                title: 'รายละเอียด',
                render: (r) => (
                  <Text size="sm" fw={r.action === 'edit' || r.action === 'cancel' ? 600 : 400}>
                    {r.detail}
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
