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

const LOGS = [
  {
    id: 1,
    at: '10:45:02',
    platform: 'Lazada',
    type: 'ดึง Order (Pull)',
    result: 'fail' as Result,
    detail: '401 Unauthorized · Access token หมดอายุ',
  },
  {
    id: 2,
    at: '10:45:00',
    platform: 'Shopee',
    type: 'Webhook: order.created',
    result: 'ok' as Result,
    detail: 'สร้าง ORD-000152 (2611130XY77)',
  },
  {
    id: 3,
    at: '10:40:11',
    platform: 'Shopee',
    type: 'Sync สถานะกลับ',
    result: 'ok' as Result,
    detail: 'ORD-000139 → shipped · IE6611300045',
  },
  {
    id: 4,
    at: '10:35:02',
    platform: 'Lazada',
    type: 'ดึง Order (Pull)',
    result: 'fail' as Result,
    detail: '401 Unauthorized',
  },
  {
    id: 5,
    at: '10:31:44',
    platform: 'Shopee',
    type: 'ดึง Order (Pull)',
    result: 'skip' as Result,
    detail: '2611130XY55 มีอยู่แล้ว · ไม่สร้าง Order ซ้ำ',
  },
  {
    id: 6,
    at: '09:58:20',
    platform: 'Inter Express',
    type: 'ดึงสถานะขนส่ง',
    result: 'fail' as Result,
    detail: 'Timeout 30s',
  },
];

function PlatformLogPage() {
  const [tab, setTab] = useState<string | null>('all');
  const [resyncOpened, resync] = useDisclosure(false);
  const rows = LOGS.filter((l) => tab === 'all' || l.result === 'fail');

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
          { label: 'สำเร็จ (24 ชม.)', value: '1,284', color: 'green' },
          { label: 'ล้มเหลว (24 ชม.)', value: 3, color: 'brand' },
          { label: 'Order ที่ดึงวันนี้', value: 212, color: 'blue' },
          { label: 'Sync สถานะกลับ', value: 198, color: 'gray' },
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
        <Tabs value={tab} onChange={setTab} mb="sm">
          <Tabs.List>
            <Tabs.Tab value="all">ทั้งหมด</Tabs.Tab>
            <Tabs.Tab value="fail">ล้มเหลว (3)</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <DataTable
          withTableBorder
          borderRadius="md"
          records={rows}
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
                    onClick={() => notifyDone('ส่งคำสั่ง Re-sync แล้ว')}
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
          <TextInput label="ตั้งแต่" defaultValue="13/11/2569 09:00" />
          <TextInput label="ถึง" defaultValue="13/11/2569 11:00" />
        </SimpleGrid>
        <Alert color="blue" variant="light">
          ระบบจะไม่สร้าง Order ซ้ำ (ตรวจด้วย Platform + Platform Order No.)
        </Alert>
      </ConfirmModal>
    </Stack>
  );
}
