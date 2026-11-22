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

/** 09-02 Receive from production / adjust stock (SRS 59, draft) */
export const Route = createFileRoute('/_app/stock/receive')({
  component: StockReceivePage,
});

const PRODUCTS = [
  { name: 'เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', unit: 'แพ็ค' },
  { name: 'น้ำจิ้ม 400g', unit: 'ขวด' },
];

const TODAY = [
  { title: 'รับเข้าจากการผลิต', note: '06:30 · โรงงาน01', change: '+180 เต้าหู้', color: 'green' },
  {
    title: 'ของเสีย/เคลม',
    note: '08:10 · พบเส้นผม (เคลม ORD-000099)',
    change: '-4 เต้าหู้',
    color: 'brand',
  },
  { title: 'ปรับยอดลด', note: '09:00 · นับสต็อก', change: '-2 น้ำจิ้ม', color: 'orange' },
];

function StockReceivePage() {
  const [type, setType] = useState('รับเข้าจากการผลิต');
  const [product, setProduct] = useState<string | null>(PRODUCTS[0]?.name ?? null);
  const [qty, setQty] = useState<number | string>(180);
  const unit = PRODUCTS.find((p) => p.name === product)?.unit ?? '';
  const isReceive = type === 'รับเข้าจากการผลิต';

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
                  data={PRODUCTS.map((p) => p.name)}
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
                    <TextInput label="Lot" defaultValue="L-261113-A" />
                    <TextInput label="วันหมดอายุ" defaultValue="20/11/2569" />
                  </>
                )}
                <Textarea
                  label="หมายเหตุ"
                  placeholder="เช่น ผลิตรอบเช้า"
                  style={{ gridColumn: '1 / -1' }}
                />
              </SimpleGrid>
              <Group justify="flex-end">
                <Button onClick={() => notifyDone(`บันทึก${type} ${qty} ${unit}แล้ว`)}>
                  บันทึกรายการ
                </Button>
              </Group>
            </Stack>
          </SectionCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SectionCard title="ล่าสุดวันนี้">
            <Stack gap="xs">
              {TODAY.map((t) => (
                <Paper key={t.note} withBorder p="sm" radius="md">
                  <Group justify="space-between" wrap="nowrap">
                    <div>
                      <Text fw={600} size="sm">
                        {t.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t.note}
                      </Text>
                    </div>
                    <StatusBadge color={t.color}>{t.change}</StatusBadge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
