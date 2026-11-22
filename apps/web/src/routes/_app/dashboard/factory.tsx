import { Alert, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertItem } from '@/components/ui/AlertItem';
import { BarList } from '@/components/ui/BarList';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { EditedAfterAcceptModal } from '@/features/factory/components/FactoryModals';
import { RoleViewSwitch } from '@/features/dashboard/components/RoleViewSwitch';

/** 02-02 Dashboard: factory view (SRS 6, pending client confirmation) */
export const Route = createFileRoute('/_app/dashboard/factory')({
  component: FactoryDashboardPage,
});

const STATS = [
  { label: 'รอโรงงานรับ', value: 28, color: 'blue', to: '/factory' },
  { label: 'โรงงานรับแล้ว', value: 15, color: 'gray', to: '/factory' },
  { label: 'รอจัดส่ง', value: 12, color: 'orange', to: '/factory/shipping' },
  { label: 'จัดส่งแล้ววันนี้', value: 40, color: 'green', to: '/factory/shipping' },
];

const BY_CARRIER = [
  { label: 'Inter Express', value: 18 },
  { label: 'Nim Express', value: 12 },
  { label: 'Fuze Express', value: 8 },
  { label: 'ส่งจากหน้าร้าน', value: 5 },
  { label: 'รถตู้/รถทัวร์', value: 3 },
].map((c) => ({ ...c, display: `${c.value} Order` }));

function FactoryDashboardPage() {
  const [flagOpened, flag] = useDisclosure(false);

  return (
    <Stack>
      <PageHeader title="แดชบอร์ดโรงงาน" pending />
      <RoleViewSwitch value="/dashboard/factory" />
      <Alert color="gold" variant="light">
        <Group justify="space-between">
          <Text size="sm">รอบตัดถัดไป: วันนี้ 12:00 น. · Order ในรอบนี้ 46 รายการ</Text>
          <Button size="xs" variant="default" component={Link} to="/factory">
            ไปที่คิว Order
          </Button>
        </Group>
      </Alert>
      <StatGrid items={STATS} />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title="คิวรอบ 13 พ.ย. 12:00 แยกตามขนส่ง">
          <BarList items={BY_CARRIER} />
        </SectionCard>
        <SectionCard
          title="สรุปยอดผลิตรอบนี้"
          actions={
            <Button size="xs" variant="subtle" component={Link} to="/factory/production">
              ดูทั้งหมด
            </Button>
          }
        >
          <Stack gap="xs">
            {[
              { name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', qty: 192, unit: 'แพ็ค' },
              { name: 'น้ำจิ้ม 400g', qty: 74, unit: 'ขวด' },
            ].map((p) => (
              <Paper key={p.name} withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <Text>{p.name}</Text>
                  <Group gap={6}>
                    <Text fz={22} fw={600}>
                      {p.qty}
                    </Text>
                    <Text c="dimmed">{p.unit}</Text>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </SimpleGrid>
      <SectionCard title="แจ้งเตือนโรงงาน">
        <Stack gap="xs">
          <AlertItem
            color="orange"
            title="Order ถูกแก้ไขหลังโรงงานรับ"
            description="ORD-000128 · จำนวนเต้าหู้ 4 → 5 · Sales01 · 10:42"
            onClick={flag.open}
          />
          <AlertItem
            color="blue"
            title="Order แทรกหลังตัดรอบ"
            description="ORD-000150 · หัวหน้าเพิ่มเข้ารอบ 13 พ.ย. 12:00"
            to="/factory"
          />
          <AlertItem
            color="brand"
            title="Order ถูกยกเลิกหลังโรงงานรับ"
            description="ORD-000117 · ลูกค้าขอยกเลิก"
            to="/users/notifications"
          />
        </Stack>
      </SectionCard>

      <EditedAfterAcceptModal opened={flagOpened} onClose={flag.close} />
    </Stack>
  );
}
