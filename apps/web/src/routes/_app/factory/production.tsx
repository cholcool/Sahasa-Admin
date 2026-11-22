import {
  Alert,
  Button,
  Group,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPrinter } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrintPreviewModal } from '@/features/factory/components/FactoryModals';
import { PRODUCTION_BY_CARRIER } from '@/features/factory/mock-data';

/** 04-02 Production summary per round (SRS 22, 14) */
export const Route = createFileRoute('/_app/factory/production')({
  component: ProductionSummaryPage,
});

const PRODUCTS = [
  { name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', total: 192, picked: 120, unit: 'แพ็ค' },
  { name: 'น้ำจิ้ม 400g', total: 74, picked: 60, unit: 'ขวด' },
];

const sum = (key: 'orders' | 'tofu' | 'sauce') =>
  PRODUCTION_BY_CARRIER.reduce((s, r) => s + r[key], 0);

function ProductionSummaryPage() {
  const [round, setRound] = useState('13');
  const [printOpened, print] = useDisclosure(false);

  return (
    <Stack>
      <PageHeader
        title="สรุปยอดผลิต"
        description="ยอดสินค้ารวมต่อรอบ ใช้วางแผนผลิตและจัดสินค้า"
        actions={
          <>
            <SegmentedControl
              size="xs"
              radius="xl"
              value={round}
              onChange={setRound}
              data={[
                { value: '13', label: '13 พ.ย. (วันนี้)' },
                { value: '14', label: '14 พ.ย.' },
                { value: '15', label: '15 พ.ย.' },
              ]}
            />
            <Button variant="default" leftSection={<IconPrinter size={16} />} onClick={print.open}>
              พิมพ์ใบสรุป
            </Button>
          </>
        }
      />
      <Alert color="orange" variant="light">
        ยอดอัปเดตอัตโนมัติ: +6 แพ็ค จาก Order แทรกหลังตัดรอบ (ORD-000150) เมื่อ 12:20 น.
      </Alert>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {PRODUCTS.map((p) => (
          <SectionCard key={p.name}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={4}>{p.name}</Title>
                <Text size="xs" c="dimmed">
                  รวมทุกขนส่ง · รอบ 13 พ.ย. 12:00
                </Text>
              </div>
              <Group gap={6} align="baseline">
                <Text fz={28} fw={600}>
                  {p.total}
                </Text>
                <Text c="dimmed">{p.unit}</Text>
              </Group>
            </Group>
            <Progress value={(p.picked / p.total) * 100} color="green" mt="sm" />
            <Text size="xs" c="dimmed" mt={4}>
              จัดแล้ว {p.picked} / {p.total}
            </Text>
          </SectionCard>
        ))}
      </SimpleGrid>
      <SectionCard title="แยกตามขนส่ง">
        <Table.ScrollContainer minWidth={560}>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ขนส่ง</Table.Th>
                <Table.Th ta="right">จำนวน Order</Table.Th>
                <Table.Th ta="right">เต้าหู้ (แพ็ค)</Table.Th>
                <Table.Th ta="right">น้ำจิ้ม (ขวด)</Table.Th>
                <Table.Th>ใบปะหน้า</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {PRODUCTION_BY_CARRIER.map((r) => (
                <Table.Tr key={r.carrier}>
                  <Table.Td>{r.carrier}</Table.Td>
                  <Table.Td ta="right">{r.orders}</Table.Td>
                  <Table.Td ta="right">{r.tofu}</Table.Td>
                  <Table.Td ta="right">{r.sauce}</Table.Td>
                  <Table.Td>
                    <StatusBadge color={r.labelColor}>{r.label}</StatusBadge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr fw={700}>
                <Table.Td>รวม</Table.Td>
                <Table.Td ta="right">{sum('orders')}</Table.Td>
                <Table.Td ta="right">{sum('tofu')}</Table.Td>
                <Table.Td ta="right">{sum('sauce')}</Table.Td>
                <Table.Td />
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      </SectionCard>
      <PrintPreviewModal
        opened={printOpened}
        onClose={print.close}
        orderCount={3}
        defaultDoc="ใบสรุปยอดผลิต"
      />
    </Stack>
  );
}
