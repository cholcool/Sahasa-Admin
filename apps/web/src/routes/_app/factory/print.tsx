import { Alert, Button, Group, Paper, SegmentedControl, Select, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrintPreviewModal } from '@/features/factory/components/FactoryModals';
import { PRINT_ROWS, type PrintRow } from '@/features/factory/mock-data';

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
  const [doc, setDoc] = useState('ใบจัดสินค้า');
  const [selected, setSelected] = useState<PrintRow[]>(() => PRINT_ROWS.slice(0, 3));
  const [previewOpened, preview] = useDisclosure(false);

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
                data={['รอบ 13 พ.ย. 12:00', 'รอบ 14 พ.ย. 12:00']}
                defaultValue="รอบ 13 พ.ย. 12:00"
                w={180}
              />
              <Select
                placeholder="ทุกขนส่ง"
                clearable
                data={['Inter Express', 'Nim Express', 'Fuze Express', 'รถตู้/รถทัวร์']}
                w={160}
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
            <Button size="xs" disabled={selected.length === 0} onClick={preview.open}>
              ดูตัวอย่างและพิมพ์
            </Button>
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            idAccessor="orderNumber"
            records={PRINT_ROWS}
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
              { accessor: 'channel', title: 'ช่องทาง' },
              { accessor: 'customer', title: 'ลูกค้า' },
              { accessor: 'carrier', title: 'ขนส่ง' },
              {
                accessor: 'labelSource',
                title: 'ที่มาใบปะหน้า',
                render: (r) =>
                  r.labelSource === 'platform' ? (
                    <StatusBadge color="blue">Platform label</StatusBadge>
                  ) : (
                    <StatusBadge>ฟอร์มระบบ</StatusBadge>
                  ),
              },
              {
                accessor: 'pickList',
                title: 'ใบจัดสินค้า',
                render: (r) => <PrintedBadge count={r.pickList} />,
              },
              {
                accessor: 'label',
                title: 'ใบปะหน้า',
                render: (r) => <PrintedBadge count={r.label} />,
              },
            ]}
          />
        </Stack>
      </Paper>
      <PrintPreviewModal
        key={doc}
        opened={previewOpened}
        onClose={preview.close}
        orderCount={selected.length}
        defaultDoc={doc}
      />
    </Stack>
  );
}
