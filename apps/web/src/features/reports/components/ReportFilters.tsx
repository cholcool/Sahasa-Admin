import { Button, Group, Select } from '@mantine/core';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { notifyDone } from '@/lib/notify';

const PERIODS = ['1–13 พ.ย. 2569', 'ต.ค. 2569', 'ไตรมาส 4/2569'];
const PRODUCTS = ['เต้าหู้คลองแงะ แพ็ค 10 ชิ้น', 'น้ำจิ้ม 400g'];

/** Period / channel / product filters + Excel export shared by report pages */
export function ReportFilters({ showExport = true }: { showExport?: boolean }) {
  // TODO: keep filter values in the URL search params once the report API exists
  return (
    <Group justify="space-between">
      <Group gap="xs">
        <Select data={PERIODS} defaultValue={PERIODS[0]} w={170} aria-label="ช่วงเวลา" />
        <Select
          data={Object.values(CHANNEL_LABEL_TH)}
          placeholder="ทุกช่องทาง"
          clearable
          w={150}
          aria-label="ช่องทาง"
        />
        <Select data={PRODUCTS} placeholder="ทุกสินค้า" clearable w={220} aria-label="สินค้า" />
      </Group>
      {showExport && <ExportExcelButton />}
    </Group>
  );
}

export function ExportExcelButton() {
  return (
    <Button
      variant="default"
      leftSection={<IconFileSpreadsheet size={16} />}
      onClick={() => notifyDone('เตรียมไฟล์ Excel แล้ว')}
    >
      ส่งออก Excel
    </Button>
  );
}
