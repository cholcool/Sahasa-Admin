import {
  Alert,
  Badge,
  Button,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconRefresh } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { nowThai, resyncLog } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';
import { notifyDone } from '@/lib/notify';

/** 07-02 Integration log with re-sync (SRS 46, 47, 48, pending) */
export const Route = createFileRoute('/_app/platforms/logs')({
  component: PlatformLogPage,
});

type Result = 'ok' | 'fail' | 'skip';

const RESULT: Record<Result, { label: string; color: string }> = {
  ok: { label: 'สำเร็จ', color: 'green' },
  fail: { label: 'ล้มเหลว', color: 'brand' },
  skip: { label: 'ข้าม (ซ้ำ)', color: 'gray' },
};

const PAGE_SIZE = 30;
const RESULT_OK: Result = 'ok';
const RESULT_FAIL: Result = 'fail';

function PlatformLogPage() {
  const [tab, setTab] = useState<string | null>('all');
  const [resyncOpened, resync] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const db = useMockDb();
  const now = nowThai();
  const today = todayIso();
  const since = dayjs(now).subtract(24, 'hour').format();
  const logs = db.platformLogs
    .filter((l) => l.at <= now)
    .map((l) => ({
      id: l.id,
      at: formatThaiDate(l.at, 'D MMM HH:mm'),
      rawAt: l.at,
      platform: l.platform,
      type: 'ดึง Order (Pull)',
      result: l.ok ? RESULT_OK : RESULT_FAIL,
      detail: l.message,
    }));
  const failed = logs.filter((l) => l.result === 'fail');
  const rows = logs.filter((l) => tab === 'all' || l.result === 'fail');
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const last24 = logs.filter((l) => dayjs(l.rawAt).isAfter(since));

  return (
    <Stack>
      <PageHeader
        title="Log การเชื่อมต่อ"
        description="ประวัติการดึงข้อมูลและ sync ทั้งสำเร็จและล้มเหลว"
        pending
        actions={
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={resync.open}>
            Re-sync ช่วงเวลา
          </Button>
        }
      />
      <StatGrid
        items={[
          {
            label: 'สำเร็จ (24 ชม.)',
            value: last24.filter((l) => l.result === 'ok').length,
            color: 'green',
          },
          {
            label: 'ล้มเหลว (24 ชม.)',
            value: last24.filter((l) => l.result === 'fail').length,
            color: 'brand',
          },
          {
            label: 'Order ที่ดึงวันนี้',
            value: db.orders.filter(
              (o) => o.platformOrderNo && o.orderDate === today && o.orderedAt <= now,
            ).length,
            color: 'blue',
          },
          {
            label: 'Sync สถานะกลับ',
            value: db.orders.filter((o) => o.sync === 'ok' && o.shippedAt?.startsWith(today))
              .length,
            color: 'gray',
          },
        ]}
      />
      <Alert color="blue" variant="light">
        ข้อเสนอสำหรับข้อ 47: ปุ่ม Re-sync อยู่ในแถวเดียวกับ log และแสดงเฉพาะแถวที่ล้มเหลว · Re-sync
        ทั้งช่วงเวลาใช้ปุ่มด้านบน{' '}
        <Badge size="xs" variant="outline">
          รอยืนยันข้อ 47
        </Badge>
      </Alert>
      <Paper withBorder radius="lg" p="md">
        <Tabs
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          mb="sm"
        >
          <Tabs.List>
            <Tabs.Tab value="all">ทั้งหมด</Tabs.Tab>
            <Tabs.Tab value="fail">ล้มเหลว ({failed.length})</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <DataTable
          withTableBorder
          borderRadius="md"
          records={pageRows}
          totalRecords={rows.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          minHeight={200}
          noRecordsText="ไม่มี log"
          paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
          rowColor={(r) => (r.result === 'fail' ? 'brand' : undefined)}
          columns={[
            { accessor: 'at', title: 'เวลา' },
            { accessor: 'platform', title: 'Platform' },
            { accessor: 'type', title: 'ประเภท' },
            {
              accessor: 'result',
              title: 'ผลลัพธ์',
              render: (r) => (
                <StatusBadge color={RESULT[r.result].color}>{RESULT[r.result].label}</StatusBadge>
              ),
            },
            { accessor: 'detail', title: 'รายละเอียด' },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (r) =>
                r.result === 'fail' && (
                  <Button
                    size="compact-xs"
                    variant="default"
                    onClick={() => {
                      resyncLog(r.id);
                      notifyDone('Re-sync สำเร็จ');
                    }}
                  >
                    Re-sync
                  </Button>
                ),
            },
          ]}
        />
      </Paper>
      <ConfirmModal
        opened={resyncOpened}
        onClose={resync.close}
        title="Re-sync ช่วงเวลา"
        confirmLabel="เริ่ม Re-sync"
        doneMessage="เริ่ม Re-sync แล้ว"
      >
        <Select
          label="Platform"
          data={['Lazada', 'Shopee', 'TikTok Shop', 'ทุก Platform']}
          defaultValue="Lazada"
        />
        <SimpleGrid cols={2}>
          <TextInput
            label="ตั้งแต่"
            defaultValue={formatThaiDate(
              dayjs(now).subtract(2, 'hour').format(),
              'DD/MM/BBBB HH:00',
            )}
          />
          <TextInput label="ถึง" defaultValue={formatThaiDate(now, 'DD/MM/BBBB HH:00')} />
        </SimpleGrid>
        <Alert color="blue" variant="light">
          ระบบจะไม่สร้าง Order ซ้ำ (ตรวจด้วย Platform + Platform Order No.)
        </Alert>
      </ConfirmModal>
    </Stack>
  );
}
