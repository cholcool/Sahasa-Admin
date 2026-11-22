import { Button, Grid, Group, Paper, Stack, Stepper, Tabs, Text } from '@mantine/core';
import { IconDownload, IconFileSpreadsheet } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { notifyDone } from '@/lib/notify';

/** 03-03 Upload orders from Excel (SRS 19, pending client confirmation) */
export const Route = createFileRoute('/_app/orders/upload')({
  component: UploadOrdersPage,
});

type IssueType = 'err' | 'dup';

interface UploadIssue {
  row: number;
  platform: string;
  ref?: string;
  column: string;
  problem: string;
  type: IssueType;
}

// TODO: replace with the validation result returned by the upload API
const ISSUES: UploadIssue[] = [
  {
    row: 7,
    platform: 'Line',
    column: 'เบอร์โทร',
    problem: 'รูปแบบเบอร์ไม่ถูกต้อง (08-123)',
    type: 'err',
  },
  { row: 12, platform: 'Facebook', column: 'สินค้า', problem: 'ไม่พบรหัสสินค้า "TOFU-20"', type: 'err' },
  {
    row: 19,
    platform: 'โทร',
    column: 'รอบส่ง',
    problem: 'วันที่ส่งเป็นวันหยุด (อา. 16 พ.ย.)',
    type: 'err',
  },
  {
    row: 31,
    platform: 'Shopee',
    column: 'Order Ref',
    problem: 'ไม่มีเลข Order ของ Platform (ต้องส่งเสมอ)',
    type: 'err',
  },
  {
    row: 22,
    platform: 'Shopee',
    ref: '2611130XY55',
    column: 'Order Ref',
    problem: 'มีในระบบแล้ว (ORD-000131) · จะไม่สร้างซ้ำ',
    type: 'dup',
  },
  {
    row: 40,
    platform: 'Lazada',
    ref: 'LZ88120931',
    column: 'Order Ref',
    problem: 'ซ้ำกับแถว 18 ในไฟล์เดียวกัน',
    type: 'dup',
  },
];

function UploadOrdersPage() {
  const [tab, setTab] = useState<string | null>('all');
  const rows = ISSUES.filter((i) => tab === 'all' || i.type === tab);
  const count = (t: IssueType) => ISSUES.filter((i) => i.type === t).length;

  return (
    <Stack>
      <PageHeader
        title="อัปโหลด Excel"
        description="บันทึกหลายรายการใน template แล้วอัปโหลดเข้าระบบ"
        pending
        actions={
          <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
            onClick={() => notifyDone('ดาวน์โหลด template (ตัวอย่าง)')}
          >
            ดาวน์โหลด Template
          </Button>
        }
      />
      <Paper withBorder radius="lg" p="md">
        <Stepper active={2} size="sm">
          <Stepper.Step label="ดาวน์โหลด Template" />
          <Stepper.Step label="อัปโหลดไฟล์" />
          <Stepper.Step label="ตรวจสอบข้อมูล" />
          <Stepper.Step label="นำเข้า" />
        </Stepper>
      </Paper>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <StatGrid
              items={[
                { label: 'แถวทั้งหมด', value: 48, color: 'blue' },
                { label: 'พร้อมนำเข้า', value: 42, color: 'green' },
                { label: 'ข้อมูลผิด', value: count('err'), color: 'brand' },
                { label: 'Order ซ้ำ', value: count('dup'), color: 'orange' },
              ]}
            />
            <SectionCard>
              <Tabs value={tab} onChange={setTab} mb="sm">
                <Tabs.List>
                  <Tabs.Tab value="all">มีปัญหาทั้งหมด ({ISSUES.length})</Tabs.Tab>
                  <Tabs.Tab value="err">ข้อมูลผิด ({count('err')})</Tabs.Tab>
                  <Tabs.Tab value="dup">ซ้ำ ({count('dup')})</Tabs.Tab>
                </Tabs.List>
              </Tabs>
              <DataTable
                withTableBorder
                borderRadius="md"
                records={rows}
                idAccessor="row"
                rowColor={(r) => (r.type === 'err' ? 'brand' : 'orange')}
                columns={[
                  { accessor: 'row', title: 'แถว', textAlign: 'right' },
                  { accessor: 'platform', title: 'Platform' },
                  {
                    accessor: 'ref',
                    title: 'Order Ref',
                    render: (r) =>
                      r.ref ? (
                        <Text ff="monospace" size="sm">
                          {r.ref}
                        </Text>
                      ) : (
                        '—'
                      ),
                  },
                  { accessor: 'column', title: 'คอลัมน์' },
                  { accessor: 'problem', title: 'ปัญหา' },
                ]}
              />
            </SectionCard>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SectionCard title="ไฟล์ที่อัปโหลด">
            <Stack>
              <Paper withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconFileSpreadsheet size={24} />
                    <div>
                      <Text fw={600}>orders_13nov.xlsx</Text>
                      <Text size="xs" c="dimmed">
                        48 แถว · 24 KB
                      </Text>
                    </div>
                  </Group>
                  <Button size="xs" variant="subtle">
                    เปลี่ยนไฟล์
                  </Button>
                </Group>
              </Paper>
              <Button
                variant="default"
                fullWidth
                onClick={() => notifyDone('ดาวน์โหลดแถวที่ผิด (ตัวอย่าง)')}
              >
                ดาวน์โหลดแถวที่ผิด
              </Button>
              <Button
                fullWidth
                onClick={() => notifyDone('นำเข้า 42 Order แล้ว · ระบบสร้างเลข Order ให้อัตโนมัติ')}
              >
                นำเข้า 42 รายการ
              </Button>
              <Text size="xs" c="dimmed">
                คอลัมน์ของ template และเกณฑ์ตรวจซ้ำของ Order ที่ไม่มีเลข Platform รอยืนยัน (Q38)
              </Text>
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
