import {
  Button,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StockDraftBanner } from '@/features/stock/components/StockDraftBanner';

/** 09-01 Stock on hand (SRS 59, draft) */
export const Route = createFileRoute('/_app/stock/')({
  component: StockOnHandPage,
});

const ITEMS = [
  { name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', unit: 'แพ็ค', reorderPoint: 80, onHand: 260, reserved: 192 },
  { name: 'น้ำจิ้ม 400g', unit: 'ขวด', reorderPoint: 100, onHand: 410, reserved: 74 },
];

const LOTS = [
  {
    id: 'L-261113-A',
    product: 'เต้าหู้ แพ็ค 10',
    produced: '13 พ.ย.',
    expires: '20 พ.ย.',
    qty: 180,
    expiringSoon: false,
  },
  {
    id: 'L-261111-B',
    product: 'เต้าหู้ แพ็ค 10',
    produced: '11 พ.ย.',
    expires: '18 พ.ย. · เหลือ 5 วัน',
    qty: 80,
    expiringSoon: true,
  },
  {
    id: 'S-261101',
    product: 'น้ำจิ้ม 400g',
    produced: '1 พ.ย.',
    expires: '1 ก.พ. 70',
    qty: 410,
    expiringSoon: false,
  },
];

function StockOnHandPage() {
  const [adjustOpened, adjust] = useDisclosure(false);
  const [mode, setMode] = useState('ปรับลด');
  const [counted, setCounted] = useState<number | string>(258);

  return (
    <Stack>
      <StockDraftBanner />
      <PageHeader
        title="สต็อกคงเหลือ"
        description="ยอดคงเหลือ จองโดย Order และพร้อมขาย"
        actions={
          <Button variant="default" onClick={adjust.open}>
            ปรับยอดสต็อก
          </Button>
        }
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {ITEMS.map((item) => {
          const available = item.onHand - item.reserved;
          const low = available < item.reorderPoint;
          return (
            <SectionCard key={item.name}>
              <Group justify="space-between" align="flex-start" mb="sm">
                <div>
                  <Title order={4}>{item.name}</Title>
                  <Text size="xs" c="dimmed">
                    จุดสั่งผลิต {item.reorderPoint} {item.unit}
                  </Text>
                </div>
                <StatusBadge color={low ? 'brand' : 'green'}>
                  {low ? 'ต่ำกว่าจุดสั่งผลิต' : 'ปกติ'}
                </StatusBadge>
              </Group>
              <SimpleGrid cols={3}>
                <Metric label="คงเหลือ" value={item.onHand} />
                <Metric label="จองโดย Order" value={item.reserved} />
                <Metric label="พร้อมขาย" value={available} highlight={low} />
              </SimpleGrid>
            </SectionCard>
          );
        })}
      </SimpleGrid>
      <SectionCard title="ตาม Lot">
        <DataTable
          withTableBorder
          borderRadius="md"
          records={LOTS}
          rowColor={(r) => (r.expiringSoon ? 'orange' : undefined)}
          columns={[
            { accessor: 'product', title: 'สินค้า' },
            {
              accessor: 'id',
              title: 'Lot',
              render: (r) => (
                <Text ff="monospace" size="sm">
                  {r.id}
                </Text>
              ),
            },
            { accessor: 'produced', title: 'ผลิตวันที่' },
            { accessor: 'expires', title: 'หมดอายุ' },
            { accessor: 'qty', title: 'คงเหลือ', textAlign: 'right' },
          ]}
        />
      </SectionCard>

      <ConfirmModal
        opened={adjustOpened}
        onClose={adjust.close}
        title="ปรับยอดสต็อก"
        confirmLabel="บันทึก"
        doneMessage="ปรับยอดสต็อกแล้ว"
        size="md"
      >
        <SegmentedControl
          data={['ปรับเพิ่ม', 'ปรับลด', 'ของเสีย/เคลม']}
          value={mode}
          onChange={setMode}
        />
        <Select label="สินค้า" data={ITEMS.map((i) => i.name)} defaultValue={ITEMS[0]?.name} />
        <SimpleGrid cols={2}>
          <NumberInput label="คงเหลือในระบบ" value={260} disabled />
          <NumberInput label="นับได้จริง" value={counted} onChange={setCounted} min={0} />
        </SimpleGrid>
        <Paper withBorder p="xs" radius="md">
          <Text size="sm">
            ผลต่าง: <b>{Number(counted) - 260}</b>
          </Text>
        </Paper>
        <Textarea label="เหตุผล" placeholder="เช่น นับสต็อกประจำวัน" />
      </ConfirmModal>
    </Stack>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fz={24} fw={600} c={highlight ? 'brand' : undefined}>
        {value}
      </Text>
    </div>
  );
}
