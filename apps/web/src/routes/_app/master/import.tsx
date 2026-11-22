import { Button, Grid, Group, Paper, Select, Stack, Stepper, Table, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { KeyValue } from '@/components/ui/KeyValue';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { notifyDone } from '@/lib/notify';

/** 08-09 Import legacy data from AppSheet (SRS 58) */
export const Route = createFileRoute('/_app/master/import')({
  component: ImportLegacyPage,
});

const TARGET_FIELDS = [
  'เลข Order อ้างอิง (Order Ref)',
  'วันส่ง',
  'ลูกค้า',
  'ช่องทางการขาย',
  'รายการสินค้า',
  'ยอดรวม',
  'ไม่นำเข้า',
];

const COLUMNS = [
  { source: 'เลขที่', sample: 'SHSC26L000011634', target: TARGET_FIELDS[0] },
  { source: 'วันที่', sample: '13/11/2026', target: TARGET_FIELDS[1] },
  { source: 'ชื่อลูกค้า', sample: 'ร้านเจ๊หมวย', target: TARGET_FIELDS[2] },
  { source: 'ช่องทาง', sample: 'L', target: TARGET_FIELDS[3] },
  { source: 'รายการ', sample: 'เต้าหู้ 5', target: TARGET_FIELDS[4] },
  { source: 'ยอดรวม', sample: '1,250', target: TARGET_FIELDS[5] },
];

function ImportLegacyPage() {
  return (
    <Stack>
      <PageHeader title="นำเข้าข้อมูลเก่า" description="ย้ายข้อมูลจาก AppSheet เข้าระบบใหม่" />
      <Paper withBorder radius="lg" p="md">
        <Stepper active={1} size="sm">
          <Stepper.Step label="เลือกไฟล์" />
          <Stepper.Step label="จับคู่คอลัมน์" />
          <Stepper.Step label="ตรวจสอบ" />
          <Stepper.Step label="นำเข้า" />
        </Stepper>
      </Paper>
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SectionCard title="จับคู่คอลัมน์ · Orders_AppSheet.xlsx">
            <Table.ScrollContainer minWidth={520}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>คอลัมน์ใน AppSheet</Table.Th>
                    <Table.Th>ตัวอย่าง</Table.Th>
                    <Table.Th>ฟิลด์ในระบบ</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {COLUMNS.map((c) => (
                    <Table.Tr key={c.source}>
                      <Table.Td fw={700}>{c.source}</Table.Td>
                      <Table.Td>
                        <Text ff="monospace" size="sm">
                          {c.sample}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Select
                          size="xs"
                          data={TARGET_FIELDS}
                          defaultValue={c.target}
                          aria-label={`ฟิลด์ของ ${c.source}`}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </SectionCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SectionCard title="ตั้งค่าการนำเข้า">
            <Stack>
              <Select
                label="ช่วงข้อมูลย้อนหลัง"
                data={['6 เดือน', '12 เดือน (พ.ย. 68 – พ.ย. 69)', 'ทั้งหมด']}
                defaultValue="12 เดือน (พ.ย. 68 – พ.ย. 69)"
                description="รอกำหนดช่วงเวลาย้อนหลังกับลูกค้า"
              />
              <Select
                label="รหัสช่องทาง H/K/L/M"
                data={['L = Line', 'H = หน้าร้าน', 'K = ?', 'M = ?']}
                defaultValue="L = Line"
                description="ความหมายตัวอักษรรอยืนยัน (Q32)"
              />
              <Paper withBorder p="sm" radius="md">
                <Stack gap={4}>
                  <KeyValue label="แถวทั้งหมด">8,412</KeyValue>
                  <KeyValue label="ลูกค้าใหม่ที่จะสร้าง">1,236</KeyValue>
                </Stack>
              </Paper>
              <Group grow>
                <Button variant="default">ย้อนกลับ</Button>
                <Button onClick={() => notifyDone('กำลังตรวจสอบ 8,412 แถว')}>ตรวจสอบข้อมูล</Button>
              </Group>
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
