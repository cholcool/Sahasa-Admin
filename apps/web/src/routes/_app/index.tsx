import { Alert, SimpleGrid, Stack } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { AlertItem } from '@/components/ui/AlertItem';
import { BarList } from '@/components/ui/BarList';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { RoleViewSwitch } from '@/features/dashboard/components/RoleViewSwitch';

/** 02-01 Dashboard: Sales/Admin view (SRS 3, 4, 5) */
export const Route = createFileRoute('/_app/')({
  component: AdminDashboardPage,
});

// TODO: replace mock numbers with the dashboard API
const STATUS_STATS = [
  { label: 'รอตรวจสอบ', value: 12, color: 'orange', to: '/orders' },
  { label: 'ยืนยันแล้ว', value: 28, color: 'blue', to: '/orders' },
  { label: 'โรงงานรับแล้ว', value: 15, color: 'gray', to: '/factory' },
  { label: 'จัดส่งแล้ว', value: 40, color: 'blue', to: '/factory/shipping' },
  { label: 'จัดส่งสำเร็จ', value: 132, color: 'green', to: '/orders' },
  { label: 'ยกเลิก', value: 3, color: 'brand', to: '/orders' },
];

const BY_CHANNEL = [
  { label: 'Shopee', value: 64 },
  { label: 'TikTok', value: 41 },
  { label: 'Lazada', value: 22 },
  { label: 'Line', value: 38 },
  { label: 'Facebook', value: 17 },
  { label: 'หน้าร้าน', value: 9 },
  { label: 'โทร', value: 6 },
];

function AdminDashboardPage() {
  return (
    <Stack>
      <RoleViewSwitch value="/" />
      <Alert color="gold" variant="light">
        รอบตัดถัดไป: วันนี้ 12:00 น. · Order ในรอบนี้ 46 รายการ · เหลือเวลา 1 ชม. 25 นาที
      </Alert>
      <StatGrid items={STATUS_STATS} />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title="Order ตามช่องทางการขาย (วันนี้)">
          <BarList items={BY_CHANNEL} />
        </SectionCard>
        <SectionCard title="แจ้งเตือน">
          <Stack gap="xs">
            <AlertItem
              color="orange"
              title="SKU จับคู่ไม่ได้ 2 รายการ"
              description="Shopee · รอ Admin จับคู่รหัสสินค้า"
              to="/platforms/unmapped-sku"
            />
            <AlertItem
              color="brand"
              title="API error: Lazada"
              description="ดึงออเดอร์ไม่สำเร็จ 10:45 น. · กด Re-sync"
              to="/platforms/logs"
            />
            <AlertItem
              color="brand"
              title="Order ถูกยกเลิกหลังโรงงานรับ"
              description="ORD-000128 · ยกเลิกจาก Platform"
              to="/orders/ORD-000128"
            />
            <AlertItem
              color="orange"
              title="Order Manual รอยืนยันรับเงิน 4 รายการ"
              description="Line 3 · Facebook 1"
              to="/orders"
            />
          </Stack>
        </SectionCard>
      </SimpleGrid>
    </Stack>
  );
}
