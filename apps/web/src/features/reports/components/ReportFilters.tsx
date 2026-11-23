import { Button, Group, Select } from '@mantine/core';
import { CHANNELS } from '@sahasa/shared';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { useState } from 'react';
import { useMockDb } from '@/features/mock/store';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import {
  periodOptions,
  type PeriodOption,
  type ReportFilter,
} from '@/features/reports/report-filter';
import { downloadText, toCsv } from '@/lib/csv';
import { todayIso } from '@/lib/dayjs';
import { notifyDone } from '@/lib/notify';

type CsvRow = Record<string, string | number | null | undefined>;

/** Filter state for a report page; period options come from the mock data range */
export function useReportFilter(defaultPeriod = 'all') {
  const db = useMockDb();
  const options = periodOptions(db.settings.from, db.settings.to, todayIso());
  const [filter, setFilter] = useState<ReportFilter>({
    period: options.some((o) => o.value === defaultPeriod) ? defaultPeriod : 'all',
    channel: null,
    productId: null,
  });
  const period: PeriodOption | undefined = options.find((o) => o.value === filter.period);
  return { filter, setFilter, options, period };
}

/** Period / channel / product filters + Excel export shared by report pages */
export function ReportFilters({
  value,
  onChange,
  options,
  exportRows,
  exportName = 'report',
  showProduct = true,
}: {
  value: ReportFilter;
  onChange: (next: ReportFilter) => void;
  options: PeriodOption[];
  exportRows?: () => CsvRow[];
  exportName?: string;
  showProduct?: boolean;
}) {
  const db = useMockDb();
  return (
    <Group justify="space-between">
      <Group gap="xs">
        <Select
          data={options.map((o) => ({ value: o.value, label: o.label }))}
          value={value.period}
          onChange={(v) => v && onChange({ ...value, period: v })}
          allowDeselect={false}
          w={230}
          aria-label="ช่วงเวลา"
        />
        <Select
          data={CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL_TH[c] }))}
          placeholder="ทุกช่องทาง"
          clearable
          value={value.channel}
          onChange={(v) => onChange({ ...value, channel: CHANNELS.find((c) => c === v) ?? null })}
          w={150}
          aria-label="ช่องทาง"
        />
        {showProduct && (
          <Select
            data={db.products.map((p) => ({ value: p.id, label: p.name }))}
            placeholder="ทุกสินค้า"
            clearable
            value={value.productId}
            onChange={(v) => onChange({ ...value, productId: v })}
            w={220}
            aria-label="สินค้า"
          />
        )}
      </Group>
      {exportRows && <ExportExcelButton rows={exportRows} filename={exportName} />}
    </Group>
  );
}

/** Downloads the given rows as a CSV file that Excel opens */
export function ExportExcelButton({
  rows,
  filename = 'export',
}: {
  rows?: () => CsvRow[];
  filename?: string;
}) {
  return (
    <Button
      variant="default"
      leftSection={<IconFileSpreadsheet size={16} />}
      onClick={() => {
        const data = rows?.() ?? [];
        if (data.length === 0) {
          notifyDone('ไม่มีข้อมูลให้ส่งออก');
          return;
        }
        downloadText(`${filename}-${todayIso()}.csv`, toCsv(data));
        notifyDone(`ส่งออก ${data.length} รายการแล้ว`);
      }}
    >
      ส่งออก Excel
    </Button>
  );
}
