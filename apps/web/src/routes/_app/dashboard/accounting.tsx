import { SimpleGrid, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { AlertItem } from '@/components/ui/AlertItem';
import { BarList } from '@/components/ui/BarList';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { RoleViewSwitch } from '@/features/dashboard/components/RoleViewSwitch';
import { formatBaht } from '@/lib/format';

/** 02-03 Dashboard: accounting view (SRS 6, pending client confirmation) */
export const Route = createFileRoute('/_app/dashboard/accounting')({
  component: AccountingDashboardPage,
});

const STATS = [
  { label: 'รอออกบิล', value: 18, color: 'orange', to: '/accounting/documents' },
  { label: 'ออกบิลแล้ววันนี้', value: 32, color: 'green', to: '/accounting/documents' },
  { label: 'รอยืนยันรับเงิน', value: 4, color: 'gold', to: '/orders' },
  { label: 'ยอดไม่ตรง (กระทบยอด)', value: 3, color: 'brand', to: '/accounting/reconcile' },
];

const SALES_BY_CHANNEL = [
  { label: 'Shopee', value: 19200 },
  { label: 'TikTok', value: 12300 },
  { label: 'Line', value: 11400 },
  { label: 'Lazada', value: 6600 },
  { label: 'Facebook', value: 5100 },
  { label: 'หน้าร้าน', value: 2700 },
  { label: 'โทร', value: 1640 },
].map((c) => ({ ...c, display: formatBaht(c.value) }));

const total = SALES_BY_CHANNEL.reduce((sum, c) => sum + c.value, 0);

function AccountingDashboardPage() {
  return (
    <Stack>
      <PageHeader title="แดชบอร์ดบัญชี" pending />
      <RoleViewSwitch value="/dashboard/accounting" />
      <StatGrid items={STATS} />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard
          title="ยอดขายวันนี้ตามช่องทาง"
          actions={<Text fw={700}>รวม {formatBaht(total)}</Text>}
        >
          <BarList items={SALES_BY_CHANNEL} color="gold" />
        </SectionCard>
        <SectionCard title="งานที่ต้องทำ">
          <Stack gap="xs">
            <AlertItem
              color="brand"
              title="กระทบยอด Shopee ไม่ตรง 3 รายการ"
              description="ส่วนต่างรวม -฿126"
              to="/accounting/reconcile"
            />
            <AlertItem
              color="orange"
              title="Order ยกเลิกหลังออกบิล 1 รายการ"
              description="ต้องออกใบลดหนี้ อ้างอิง INV-2611-0040"
              to="/accounting/credit-notes"
            />
            <AlertItem
              color="gold"
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
