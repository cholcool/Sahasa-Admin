import { Alert, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreditNoteModal } from '@/features/accounting/components/CreditNoteModal';
import { splitVat } from '@/features/accounting/vat';
import { formatAmount } from '@/lib/format';

/** 05-03 Credit notes (SRS 32) */
export const Route = createFileRoute('/_app/accounting/credit-notes')({
  component: CreditNotesPage,
});

const NOTES = [
  {
    no: 'CN-2611-0003',
    invoice: 'INV-2611-0038',
    order: 'ORD-000117',
    customer: 'ครัวป้าศรี',
    reason: 'ยกเลิก Order',
    total: 950,
    date: '11 พ.ย.',
    voided: false,
  },
  {
    no: 'CN-2611-0002',
    invoice: 'INV-2611-0021',
    order: 'ORD-000098',
    customer: 'บจก. สยามฟู้ด',
    reason: 'คืนสินค้าบางส่วน',
    total: 380,
    date: '6 พ.ย.',
    voided: false,
  },
  {
    no: 'CN-2611-0001',
    invoice: 'INV-2611-0007',
    order: 'ORD-000061',
    customer: 'คุณนิด',
    reason: 'ลดราคา',
    total: 100,
    date: '2 พ.ย.',
    voided: true,
  },
];

function CreditNotesPage() {
  const [opened, modal] = useDisclosure(false);
  return (
    <Stack>
      <PageHeader
        title="ใบลดหนี้"
        description="ออกเมื่อยกเลิกหรือคืนสินค้าหลังออกบิล โดยอ้างอิงเลขที่บิลเดิม"
        actions={<Button onClick={modal.open}>สร้างใบลดหนี้</Button>}
      />
      <Alert color="gold" variant="light">
        <Group justify="space-between">
          <Text size="sm">ORD-000144 ถูกยกเลิกหลังออกบิล INV-2611-0040 · ต้องออกใบลดหนี้</Text>
          <Button size="xs" variant="default" onClick={modal.open}>
            สร้างจากรายการนี้
          </Button>
        </Group>
      </Alert>
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="no"
          records={NOTES}
          columns={[
            {
              accessor: 'no',
              title: 'เลขที่',
              render: (r) => (
                <Text ff="monospace" fw={700} size="sm">
                  {r.no}
                </Text>
              ),
            },
            {
              accessor: 'invoice',
              title: 'อ้างอิงบิล',
              render: (r) => (
                <Text ff="monospace" size="sm">
                  {r.invoice}
                </Text>
              ),
            },
            { accessor: 'order', title: 'Order' },
            { accessor: 'customer', title: 'ลูกค้า' },
            { accessor: 'reason', title: 'เหตุผล' },
            {
              accessor: 'base',
              title: 'มูลค่าลดหนี้',
              textAlign: 'right',
              render: (r) => formatAmount(splitVat(r.total).base),
            },
            {
              accessor: 'vat',
              title: 'VAT',
              textAlign: 'right',
              render: (r) => formatAmount(splitVat(r.total).vat),
            },
            { accessor: 'date', title: 'วันที่' },
            {
              accessor: 'voided',
              title: 'สถานะ',
              render: (r) =>
                r.voided ? (
                  <StatusBadge>ยกเลิกเอกสาร</StatusBadge>
                ) : (
                  <StatusBadge color="green">ออกแล้ว</StatusBadge>
                ),
            },
          ]}
        />
      </Paper>
      <CreditNoteModal opened={opened} onClose={modal.close} />
    </Stack>
  );
}
