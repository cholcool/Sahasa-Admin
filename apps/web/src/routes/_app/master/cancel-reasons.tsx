import { Alert, Button, Checkbox, Paper, Stack, Switch } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SimpleItemModal } from '@/features/master/components/SimpleItemModal';

/** 08-06 Cancel reasons (SRS 55) */
export const Route = createFileRoute('/_app/master/cancel-reasons')({
  component: CancelReasonsPage,
});

interface ReasonRow {
  order: number;
  reason: string;
  noteRequired: boolean;
  usedThisMonth: number;
}

const REASONS: ReasonRow[] = [
  { order: 1, reason: 'ลูกค้าขอยกเลิก', noteRequired: false, usedThisMonth: 12 },
  { order: 2, reason: 'ชำระเงินไม่สำเร็จ', noteRequired: false, usedThisMonth: 7 },
  { order: 3, reason: 'ที่อยู่ไม่ถูกต้อง / ติดต่อไม่ได้', noteRequired: false, usedThisMonth: 4 },
  { order: 4, reason: 'สินค้าหมด / ผลิตไม่ทัน', noteRequired: false, usedThisMonth: 3 },
  { order: 5, reason: 'Order ซ้ำ', noteRequired: false, usedThisMonth: 2 },
  { order: 6, reason: 'ยกเลิกจาก Platform (อัตโนมัติ)', noteRequired: false, usedThisMonth: 5 },
  { order: 7, reason: 'อื่นๆ', noteRequired: true, usedThisMonth: 1 },
];

function CancelReasonsPage() {
  const [editing, setEditing] = useState<ReasonRow | 'new' | null>(null);
  const row = editing === 'new' ? undefined : (editing ?? undefined);

  return (
    <Stack>
      <Alert color="orange" variant="light">
        รายการเหตุผลด้านล่างเป็นตัวอย่าง รอรายการจริงจากลูกค้า (Q39)
      </Alert>
      <PageHeader
        title="เหตุผลยกเลิก"
        description="รายการที่ผู้ใช้ต้องเลือกเมื่อยกเลิก Order"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing('new')}>
            เพิ่ม
          </Button>
        }
      />
      <Paper withBorder radius="lg" p="md">
        <DataTable
          withTableBorder
          borderRadius="md"
          idAccessor="order"
          records={REASONS}
          columns={[
            { accessor: 'order', title: 'ลำดับ', width: 70 },
            { accessor: 'reason', title: 'เหตุผล' },
            {
              accessor: 'noteRequired',
              title: 'ต้องระบุหมายเหตุ',
              render: (r) => (r.noteRequired ? 'ต้อง' : 'ไม่ต้อง'),
            },
            { accessor: 'usedThisMonth', title: 'ใช้แล้ว (เดือนนี้)', textAlign: 'right' },
            {
              accessor: 'active',
              title: 'ใช้งาน',
              render: () => <Switch defaultChecked aria-label="ใช้งาน" />,
            },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (r) => (
                <Button size="compact-xs" variant="default" onClick={() => setEditing(r)}>
                  แก้ไข
                </Button>
              ),
            },
          ]}
        />
      </Paper>
      <SimpleItemModal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={row ? 'แก้ไขเหตุผลยกเลิก' : 'เพิ่มเหตุผลยกเลิก'}
        name={row?.reason}
        namePlaceholder="เช่น ลูกค้าเปลี่ยนใจ"
        doneMessage={row ? 'บันทึกแล้ว' : 'เพิ่มเหตุผลแล้ว'}
      >
        <Checkbox
          key={row?.reason}
          label="ต้องระบุหมายเหตุเพิ่มเติม"
          defaultChecked={row?.noteRequired}
        />
      </SimpleItemModal>
    </Stack>
  );
}
