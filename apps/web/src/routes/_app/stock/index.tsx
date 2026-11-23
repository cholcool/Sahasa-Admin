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
import { addStockReceipt, nowThai } from '@/features/mock/actions';
import { stockOnHand, stockReserved } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';

/** 09-01 Stock on hand (SRS 59, draft) */
export const Route = createFileRoute('/_app/stock/')({
  component: StockOnHandPage,
});

function StockOnHandPage() {
  const db = useMockDb();
  const now = nowThai();
  const today = todayIso();
  const ITEMS = db.products.map((p) => ({
    name: p.name,
    unit: p.unit,
    reorderPoint: p.kind === 'tofu' ? 500 : 30,
    onHand: stockOnHand(db, p.id, now),
    reserved: stockReserved(db, p.id),
  }));
  // Latest production lots (tofu keeps 7 days, sauce 90 days)
  const LOTS = db.products.flatMap((p) =>
    db.stockReceipts
      .filter((r) => r.productId === p.id && r.at <= now)
      .slice(-3)
      .toReversed()
      .map((r) => {
        const expires = dayjs(r.at)
          .add(p.kind === 'tofu' ? 7 : 90, 'day')
          .format('YYYY-MM-DD');
        const left = dayjs(expires).diff(dayjs(today), 'day');
        return {
          id: r.lot === 'ยอดยกมา' ? `${r.lot} ${p.shortName}` : r.lot,
          product: p.name,
          produced: formatThaiDate(r.at, 'D MMM'),
          expires: `${formatThaiDate(expires, 'D MMM BB')}${left <= 5 && left >= 0 ? ` · เหลือ ${left} วัน` : left < 0 ? ' · หมดอายุ' : ''}`,
          qty: r.qty,
          expiringSoon: left <= 5,
        };
      }),
  );
  const [adjustOpened, adjust] = useDisclosure(false);
  const [mode, setMode] = useState('ปรับลด');
  const [adjustIndex, setAdjustIndex] = useState(0);
  const [counted, setCounted] = useState<number | string>(ITEMS[0]?.onHand ?? 0);

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
        onConfirm={() => {
          const p = db.products[adjustIndex];
          const diff = Number(counted) - (ITEMS[adjustIndex]?.onHand ?? 0);
          if (p && diff !== 0) addStockReceipt(p.id, diff, `ปรับยอด (${mode})`);
        }}
      >
        <SegmentedControl
          data={['ปรับเพิ่ม', 'ปรับลด', 'ของเสีย/เคลม']}
          value={mode}
          onChange={setMode}
        />
        <Select
          label="สินค้า"
          data={ITEMS.map((i, idx) => ({ value: String(idx), label: i.name }))}
          value={String(adjustIndex)}
          onChange={(v) => {
            const idx = Number(v) || 0;
            setAdjustIndex(idx);
            setCounted(ITEMS[idx]?.onHand ?? 0);
          }}
          allowDeselect={false}
        />
        <SimpleGrid cols={2}>
          <NumberInput label="คงเหลือในระบบ" value={ITEMS[adjustIndex]?.onHand ?? 0} disabled />
          <NumberInput label="นับได้จริง" value={counted} onChange={setCounted} min={0} />
        </SimpleGrid>
        <Paper withBorder p="xs" radius="md">
          <Text size="sm">
            ผลต่าง: <b>{Number(counted) - (ITEMS[adjustIndex]?.onHand ?? 0)}</b>
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
