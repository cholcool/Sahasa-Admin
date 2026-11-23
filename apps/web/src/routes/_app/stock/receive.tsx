import {
  Button,
  Grid,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StockDraftBanner } from '@/features/stock/components/StockDraftBanner';
import { notifyDone } from '@/lib/notify';
import { addStockReceipt, nowThai } from '@/features/mock/actions';
import { stockMovements } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import { dayjs, formatThaiDate, todayIso } from '@/lib/dayjs';

/** 09-02 Receive from production / adjust stock (SRS 59, draft) */
export const Route = createFileRoute('/_app/stock/receive')({
  component: StockReceivePage,
});

function StockReceivePage() {
  const db = useMockDb();
  const today = todayIso();
  const [type, setType] = useState('รับเข้าจากการผลิต');
  const [product, setProduct] = useState<string | null>(db.products[0]?.id ?? null);
  const [qty, setQty] = useState<number | string>(500);
  const p = db.products.find((x) => x.id === product);
  const unit = p?.unit ?? '';
  const isReceive = type === 'รับเข้าจากการผลิต';
  const defaultLot = `LOT-${dayjs(today).format('YYMMDD')}-${p?.kind === 'sauce' ? 'S' : 'T'}`;
  const [lot, setLot] = useState('');
  const save = () => {
    const n = Math.abs(Number(qty) || 0);
    if (!p || n === 0) return;
    const signed = type === 'รับเข้าจากการผลิต' || type === 'ปรับยอดเพิ่ม' ? n : -n;
    addStockReceipt(p.id, signed, isReceive ? lot.trim() || defaultLot : `ปรับยอด (${type})`);
    notifyDone(`บันทึก${type} ${n} ${unit}แล้ว`);
  };
  const todayMoves = stockMovements(db, nowThai())
    .filter((m) => m.type !== 'order' && m.at.startsWith(today))
    .slice(0, 6);

  return (
    <Stack>
      <StockDraftBanner />
      <PageHeader title="รับเข้า / ปรับยอด" description="บันทึกรับเข้าจากการผลิต ปรับยอด หรือของเสีย" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SectionCard title="บันทึกรายการ">
            <Stack>
              <SegmentedControl
                value={type}
                onChange={setType}
                data={['รับเข้าจากการผลิต', 'ปรับยอดเพิ่ม', 'ปรับยอดลด', 'ของเสีย/เคลม']}
              />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select
                  label="สินค้า"
                  withAsterisk
                  data={db.products.map((x) => ({ value: x.id, label: x.name }))}
                  value={product}
                  onChange={setProduct}
                />
                <NumberInput
                  label="จำนวน"
                  withAsterisk
                  min={1}
                  value={qty}
                  onChange={setQty}
                  rightSection={<Text size="xs">{unit}</Text>}
                  rightSectionWidth={44}
                />
                {isReceive && (
                  <>
                    <TextInput
                      label="Lot"
                      placeholder={defaultLot}
                      value={lot}
                      onChange={(e) => setLot(e.currentTarget.value)}
                    />
                    <TextInput
                      label="วันหมดอายุ"
                      readOnly
                      value={formatThaiDate(
                        dayjs(today)
                          .add(p?.kind === 'sauce' ? 90 : 7, 'day')
                          .format('YYYY-MM-DD'),
                        'DD/MM/BBBB',
                      )}
                    />
                  </>
                )}
                <Textarea
                  label="หมายเหตุ"
                  placeholder="เช่น ผลิตรอบเช้า"
                  style={{ gridColumn: '1 / -1' }}
                />
              </SimpleGrid>
              <Group justify="flex-end">
                <Button onClick={save} disabled={!p || !Number(qty)}>
                  บันทึกรายการ
                </Button>
              </Group>
            </Stack>
          </SectionCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SectionCard title="ล่าสุดวันนี้">
            <Stack gap="xs">
              {todayMoves.length === 0 && (
                <Text size="sm" c="dimmed">
                  ยังไม่มีรายการวันนี้
                </Text>
              )}
              {todayMoves.map((t) => {
                const name = db.products.find((x) => x.id === t.productId)?.shortName ?? '';
                const change = t.in ? `+${t.in} ${name}` : `-${t.out} ${name}`;
                return (
                  <Paper key={t.id} withBorder p="sm" radius="md">
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Text fw={600} size="sm">
                          {t.type === 'receive' ? 'รับเข้าจากการผลิต' : t.ref}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatThaiDate(t.at, 'HH:mm')} · {t.by}
                          {t.type === 'receive' && ` · ${t.ref}`}
                        </Text>
                      </div>
                      <StatusBadge color={t.in ? 'green' : 'orange'}>{change}</StatusBadge>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
