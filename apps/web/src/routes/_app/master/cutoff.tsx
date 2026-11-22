import {
  ActionIcon,
  Button,
  Chip,
  Divider,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { deliveryRoundFor, parseTime } from '@/features/master/cutoff';
import { notifyDone } from '@/lib/notify';

/** 08-07 Cut-off time, non-delivery days and edit window (SRS 56) */
export const Route = createFileRoute('/_app/master/cutoff')({
  component: CutoffPage,
});

// Chip values are JS weekday numbers (0 = Sunday)
const WEEKDAYS = [
  { value: '1', label: 'จ.' },
  { value: '2', label: 'อ.' },
  { value: '3', label: 'พ.' },
  { value: '4', label: 'พฤ.' },
  { value: '5', label: 'ศ.' },
  { value: '6', label: 'ส.' },
  { value: '0', label: 'อา.' },
];
const DAY_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const HOLIDAYS = [
  { date: '31 ธ.ค. 2569', name: 'วันสิ้นปี' },
  { date: '1 ม.ค. 2570', name: 'วันขึ้นปีใหม่' },
];

// Sample order times for the preview: Mon 13:00, Tue 12:01, Sat 12:01 (week of 16 Nov 2026)
const SAMPLES = [
  new Date(2026, 10, 16, 13, 0),
  new Date(2026, 10, 17, 12, 1),
  new Date(2026, 10, 21, 12, 1),
];

function CutoffPage() {
  const [time, setTime] = useState('12:00');
  const [offDays, setOffDays] = useState<string[]>(['0']);
  const cutoffMinutes = parseTime(time);

  const preview = () => {
    if (cutoffMinutes === null) return [];
    const rule = { cutoffMinutes, offDays: offDays.map(Number) };
    try {
      return SAMPLES.map((orderedAt) => {
        const round = deliveryRoundFor(orderedAt, rule);
        const skipped = round.getDate() - orderedAt.getDate() > 1;
        return {
          key: orderedAt.toISOString(),
          text: `สั่ง ${DAY_SHORT[orderedAt.getDay()]} ${orderedAt.getHours()}:${String(orderedAt.getMinutes()).padStart(2, '0')}`,
          round: `ส่งรอบ ${DAY_SHORT[round.getDay()]} ${time}${skipped ? ' (ข้ามวันไม่ส่ง)' : ''}`,
        };
      });
    } catch (e) {
      return [{ key: 'err', text: e instanceof Error ? e.message : 'ตั้งค่าไม่ถูกต้อง', round: '' }];
    }
  };

  return (
    <Stack>
      <PageHeader
        title="เวลาตัดรอบ"
        description="กำหนดรอบส่งและเงื่อนไขหลังตัดรอบ"
        actions={<Button onClick={() => notifyDone('บันทึกเวลาตัดรอบแล้ว')}>บันทึก</Button>}
      />
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SectionCard title="ตั้งค่ารอบ">
            <Stack>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label="เวลาตัดรอบ"
                  withAsterisk
                  value={time}
                  onChange={(e) => setTime(e.currentTarget.value)}
                  error={cutoffMinutes === null ? 'รูปแบบเวลา HH:MM' : undefined}
                />
                <Select label="จำนวนรอบส่งต่อวัน" data={['1 รอบ', '2 รอบ']} defaultValue="1 รอบ" />
              </SimpleGrid>
              <div>
                <Text size="sm" fw={500} mb={6}>
                  วันที่ไม่ส่งสินค้า
                </Text>
                <Chip.Group multiple value={offDays} onChange={setOffDays}>
                  <Group gap="xs">
                    {WEEKDAYS.map((d) => (
                      <Chip key={d.value} value={d.value} size="sm">
                        {d.label}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              </div>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label="แก้ไข Order ได้ถึง"
                  defaultValue="20 ชั่วโมงหลังตัดรอบ"
                  description="ความหมายของเงื่อนไข 20 ชั่วโมงรอยืนยัน (Q9)"
                />
                <Select
                  label="Order หลังตัดรอบ"
                  data={['เข้ารอบถัดไปอัตโนมัติ', 'ถามผู้ใช้ทุกครั้ง']}
                  defaultValue="เข้ารอบถัดไปอัตโนมัติ"
                />
              </SimpleGrid>
              <Divider />
              <Group justify="space-between">
                <Title order={5}>วันหยุดพิเศษ</Title>
                <Button size="xs" variant="subtle" leftSection={<IconPlus size={14} />}>
                  เพิ่มวันหยุด
                </Button>
              </Group>
              <Table withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>วันที่</Table.Th>
                    <Table.Th>ชื่อวันหยุด</Table.Th>
                    <Table.Th w={50} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {HOLIDAYS.map((h) => (
                    <Table.Tr key={h.date}>
                      <Table.Td>{h.date}</Table.Td>
                      <Table.Td>{h.name}</Table.Td>
                      <Table.Td>
                        <ActionIcon variant="subtle" color="gray" aria-label="ลบวันหยุด">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </SectionCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SectionCard title="ตัวอย่างรอบ">
            <Stack gap="xs">
              {preview().map((p) => (
                <Paper key={p.key} withBorder p="sm" radius="md">
                  <Text fw={600} size="sm">
                    {p.text}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {p.round}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
