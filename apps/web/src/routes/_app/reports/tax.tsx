import { Alert, Badge, Paper, Select, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatGrid } from '@/components/ui/StatCard';
import { splitVat } from '@/features/accounting/vat';
import { useMockDb } from '@/features/mock/store';
import { ExportExcelButton } from '@/features/reports/components/ReportFilters';
import { formatThaiDate } from '@/lib/dayjs';
import { formatAmount, formatBaht } from '@/lib/format';

/** 06-04 Output tax report (SRS 38, scope pending) */
export const Route = createFileRoute('/_app/reports/tax')({
  component: TaxReportPage,
});

const PAGE_SIZE = 25;

function TaxReportPage() {
  const db = useMockDb();
  const months = [
    ...new Set([...db.documents, ...db.creditNotes].map((d) => d.issuedAt.slice(0, 7))),
  ]
    .toSorted()
    .toReversed();
  const [month, setMonth] = useState<string | null>(months[0] ?? null);
  const [page, setPage] = useState(1);

  const taxIdOf = (orderNumber: string) => {
    const o = db.orders.find((x) => x.orderNumber === orderNumber);
    return db.customers.find((c) => c.id === o?.customerId)?.taxId;
  };
  const rows = [
    ...db.documents
      .filter((d) => d.billing === 'VAT' && d.issuedAt.startsWith(month ?? ''))
      .map((d) => ({
        at: d.issuedAt,
        no: d.no,
        buyer: d.customerName,
        taxId: taxIdOf(d.orderNumber),
        total: d.total,
      })),
    ...db.creditNotes
      .filter((c) => !c.voided && c.issuedAt.startsWith(month ?? ''))
      .map((c) => ({
        at: c.issuedAt,
        no: c.no,
        buyer: c.customerName,
        taxId: taxIdOf(c.orderNumber),
        total: -c.total,
      })),
  ].toSorted((a, b) => a.at.localeCompare(b.at));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const invoices = rows.filter((r) => r.total > 0);
  const credits = rows.filter((r) => r.total < 0);
  const sumBy = (list: typeof rows, key: 'base' | 'vat') =>
    list.reduce((s, r) => s + Math.round(splitVat(r.total)[key] * 100), 0) / 100;

  return (
    <Stack>
      <PageHeader
        title="รายงานภาษีขาย"
        description="จากบิล VAT ที่ออกในระบบ"
        pending
        actions={
          <ExportExcelButton
            filename="output-tax"
            rows={() =>
              rows.map((r) => ({
                วันที่: formatThaiDate(r.at, 'DD/MM/BB'),
                เลขที่: r.no,
                ผู้ซื้อ: r.buyer,
                เลขผู้เสียภาษี: r.taxId ?? '',
                มูลค่า: splitVat(r.total).base,
                VAT: splitVat(r.total).vat,
              }))
            }
          />
        }
      />
      <Alert color="orange" variant="light">
        ไม่มีในฟังก์ชันที่สรุปกับ Owner · รอยืนยันขอบเขต (SRS ข้อ 38){' '}
        <Badge size="xs" variant="outline" color="orange">
          รอยืนยัน
        </Badge>
      </Alert>
      <Select
        data={months.map((m) => ({ value: m, label: formatThaiDate(`${m}-01`, 'MMMM BBBB') }))}
        value={month}
        onChange={(v) => {
          setMonth(v);
          setPage(1);
        }}
        allowDeselect={false}
        placeholder="ยังไม่มีเอกสาร"
        w={200}
        aria-label="เดือนภาษี"
      />
      <StatGrid
        items={[
          {
            label: 'มูลค่าสินค้า/บริการ',
            value: formatBaht(sumBy(rows, 'base'), { decimals: true }),
            color: 'blue',
          },
          {
            label: 'ภาษีขาย 7%',
            value: formatBaht(sumBy(rows, 'vat'), { decimals: true }),
            color: 'orange',
          },
          {
            label: 'รวม',
            value: formatBaht(
              rows.reduce((s, r) => s + r.total, 0),
              { decimals: true },
            ),
            color: 'green',
            hint: `ใบกำกับ ${invoices.length} ฉบับ`,
          },
          {
            label: 'ใบลดหนี้',
            value: formatBaht(
              credits.reduce((s, r) => s + r.total, 0),
              { decimals: true },
            ),
            color: 'brand',
            hint: `${credits.length} ฉบับ`,
          },
        ]}
      />
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          minHeight={160}
          idAccessor="no"
          records={pageRows}
          totalRecords={rows.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
          noRecordsText="ไม่มีบิล VAT ในเดือนนี้"
          columns={[
            { accessor: 'at', title: 'วันที่', render: (r) => formatThaiDate(r.at, 'DD/MM/BB') },
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
            { accessor: 'branch', title: 'สาขา', render: (r) => (r.taxId ? 'สำนักงานใหญ่' : '—') },
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
