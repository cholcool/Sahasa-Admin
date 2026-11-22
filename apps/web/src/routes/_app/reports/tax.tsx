import { Alert, Badge, Paper, Select, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { splitVat } from '@/features/accounting/vat';
import { ExportExcelButton } from '@/features/reports/components/ReportFilters';
import { formatAmount } from '@/lib/format';

/** 06-04 Output tax report (SRS 38, scope pending) */
export const Route = createFileRoute('/_app/reports/tax')({
  component: TaxReportPage,
});

const ROWS = [
  {
    date: '12/11/69',
    no: 'INV-2611-0042',
    buyer: 'บจก. สยามฟู้ด',
    taxId: '0105561234567',
    branch: 'สำนักงานใหญ่',
    total: 2850,
  },
  {
    date: '12/11/69',
    no: 'INV-2611-0041',
    buyer: 'คุณนิด',
    taxId: undefined,
    branch: undefined,
    total: 570,
  },
  {
    date: '11/11/69',
    no: 'CN-2611-0003',
    buyer: 'ครัวป้าศรี',
    taxId: '3900100234567',
    branch: 'สำนักงานใหญ่',
    total: -950,
  },
];

function TaxReportPage() {
  return (
    <Stack>
      <PageHeader
        title="รายงานภาษีขาย"
        description="จากบิล VAT ที่ออกในระบบ"
        pending
        actions={<ExportExcelButton />}
      />
      <Alert color="orange" variant="light">
        ไม่มีในฟังก์ชันที่สรุปกับ Owner · รอยืนยันขอบเขต (SRS ข้อ 38){' '}
        <Badge size="xs" variant="outline" color="orange">
          รอยืนยัน
        </Badge>
      </Alert>
      <Select
        data={['พฤศจิกายน 2569', 'ตุลาคม 2569']}
        defaultValue="พฤศจิกายน 2569"
        w={200}
        aria-label="เดือนภาษี"
      />
      <StatGrid
        items={[
          { label: 'มูลค่าสินค้า/บริการ', value: '฿148,224.30', color: 'blue' },
          { label: 'ภาษีขาย 7%', value: '฿10,375.70', color: 'orange' },
          { label: 'รวม', value: '฿158,600.00', color: 'green' },
          { label: 'ใบลดหนี้', value: '-฿1,331.46', color: 'brand', hint: '3 ฉบับ' },
        ]}
      />
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="no"
          records={ROWS}
          columns={[
            { accessor: 'date', title: 'วันที่' },
            {
              accessor: 'no',
              title: 'เลขที่ใบกำกับ',
              render: (r) => (
                <Text ff="monospace" size="sm">
                  {r.no}
                </Text>
              ),
            },
            { accessor: 'buyer', title: 'ชื่อผู้ซื้อ' },
            {
              accessor: 'taxId',
              title: 'เลขผู้เสียภาษี',
              render: (r) =>
                r.taxId ? (
                  <Text ff="monospace" size="sm">
                    {r.taxId}
                  </Text>
                ) : (
                  '—'
                ),
            },
            { accessor: 'branch', title: 'สาขา', render: (r) => r.branch ?? '—' },
            {
              accessor: 'base',
              title: 'มูลค่า',
              textAlign: 'right',
              render: (r) => formatAmount(splitVat(r.total).base),
            },
            {
              accessor: 'vat',
              title: 'VAT',
              textAlign: 'right',
              render: (r) => formatAmount(splitVat(r.total).vat),
            },
          ]}
        />
      </Paper>
    </Stack>
  );
}
