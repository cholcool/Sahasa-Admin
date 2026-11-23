import { Alert, Button, Group, Paper, SegmentedControl, Select, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrintPreviewModal } from '@/features/factory/components/FactoryModals';
import { markPrinted } from '@/features/mock/actions';
import { isMarketplace } from '@/features/mock/catalog';
import { carrierName, roundLabel, roundOrders } from '@/features/mock/selectors';
import { useMockDb } from '@/features/mock/store';
import type { MockOrder } from '@/features/mock/types';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { dayjs, todayIso } from '@/lib/dayjs';

/** 04-03 Print pick lists and shipping labels (SRS 23, 24) */
export const Route = createFileRoute('/_app/factory/print')({
  component: PrintDocumentsPage,
});

function PrintedBadge({ count }: { count: number }) {
  return count > 0 ? (
    <StatusBadge color="green">พิมพ์แล้ว {count} ครั้ง</StatusBadge>
  ) : (
    <StatusBadge color="orange">ยังไม่พิมพ์</StatusBadge>
  );
}

function PrintDocumentsPage() {
  const db = useMockDb();
  const today = todayIso();
  const [doc, setDoc] = useState('ใบจัดสินค้า');
  const [round, setRound] = useState<string | null>(today);
  const [carrier, setCarrier] = useState<string | null>(null);
  const [selected, setSelected] = useState<MockOrder[]>([]);
  const [previewOpened, preview] = useDisclosure(false);

  const rows = roundOrders(db, round ?? today)
    .filter((o) => !carrier || o.carrierId === carrier)
    .toSorted((a, b) => a.orderedAt.localeCompare(b.orderedAt));

  return (
    <Stack>
      <PageHeader title="พิมพ์เอกสาร" description="พิมพ์ใบจัดสินค้าและใบปะหน้า ทีละรายการหรือหลายรายการ" />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group justify="space-between">
            <SegmentedControl
              radius="xl"
              value={doc}
              onChange={setDoc}
              data={['ใบจัดสินค้า', 'ใบปะหน้า']}
            />
            <Group gap="xs">
              <Select
                aria-label="รอบส่ง"
                data={[-1, 0, 1, 2].map((i) => {
                  const d = dayjs(today).add(i, 'day').format('YYYY-MM-DD');
                  return { value: d, label: `รอบ ${roundLabel(d, today)} 12:00` };
                })}
                value={round}
                onChange={(v) => {
                  setRound(v);
                  setSelected([]);
                }}
                allowDeselect={false}
                w={200}
              />
              <Select
                aria-label="ขนส่ง"
                placeholder="ทุกขนส่ง"
                clearable
                data={db.carriers.map((c) => ({ value: c.id, label: c.name }))}
                value={carrier}
                onChange={setCarrier}
                w={170}
              />
            </Group>
          </Group>
          <Alert color="blue" variant="light">
            Order จาก Marketplace ดึง label จาก Platform · Order Manual พิมพ์ใบปะหน้าจากระบบ (รูปแบบของ
            Inter / Nim / Fuze รอยืนยัน)
          </Alert>
          <Group justify="space-between">
            <Text size="sm">
              เลือก <b>{selected.length}</b> รายการ
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                variant="default"
                disabled={rows.length === 0}
                onClick={() =>
                  setSelected(
                    rows.filter(
                      (r) => (doc === 'ใบปะหน้า' ? r.printed.label : r.printed.pickList) === 0,
                    ),
                  )
                }
              >
                เลือกที่ยังไม่พิมพ์
              </Button>
              <Button size="xs" disabled={selected.length === 0} onClick={preview.open}>
                ดูตัวอย่างและพิมพ์
              </Button>
            </Group>
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            minHeight={200}
            idAccessor="orderNumber"
            records={rows}
            noRecordsText="ไม่มี Order ในรอบนี้"
            selectedRecords={selected}
            onSelectedRecordsChange={setSelected}
            columns={[
              {
                accessor: 'orderNumber',
                title: 'เลข Order',
                render: (r) => (
                  <Text fw={600} size="sm">
                    {r.orderNumber}
                  </Text>
                ),
              },
              { accessor: 'channel', title: 'ช่องทาง', render: (r) => CHANNEL_LABEL_TH[r.channel] },
              { accessor: 'customerName', title: 'ลูกค้า' },
              { accessor: 'carrierId', title: 'ขนส่ง', render: (r) => carrierName(r.carrierId) },
              {
                accessor: 'labelSource',
                title: 'ที่มาใบปะหน้า',
                render: (r) =>
                  isMarketplace(r.channel) ? (
                    <StatusBadge color="blue">Platform label</StatusBadge>
                  ) : (
                    <StatusBadge>ฟอร์มระบบ</StatusBadge>
                  ),
              },
              {
                accessor: 'pickList',
                title: 'ใบจัดสินค้า',
                render: (r) => <PrintedBadge count={r.printed.pickList} />,
              },
              {
                accessor: 'label',
                title: 'ใบปะหน้า',
                render: (r) => <PrintedBadge count={r.printed.label} />,
              },
            ]}
          />
        </Stack>
      </Paper>
      <PrintPreviewModal
        key={doc}
        opened={previewOpened}
        onClose={preview.close}
        orders={selected}
        defaultDoc={doc}
        onPrinted={(printedDoc) => {
          markPrinted(
            selected.map((o) => o.orderNumber),
            printedDoc === 'ใบปะหน้า' ? 'label' : 'pickList',
          );
          setSelected([]);
        }}
      />
    </Stack>
  );
}
