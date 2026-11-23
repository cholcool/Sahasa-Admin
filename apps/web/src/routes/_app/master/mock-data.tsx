import {
  Alert,
  Button,
  FileButton,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconDatabaseExport,
  IconDatabaseImport,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { ORDER_STATUSES } from '@sahasa/shared';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatGrid } from '@/components/ui/StatCard';
import { DEFAULT_SETTINGS } from '@/features/mock/generate';
import { randomSeed } from '@/features/mock/random';
import { statusCounts } from '@/features/mock/selectors';
import {
  clearMockDb,
  exportMockDb,
  importMockDb,
  regenerateMockDb,
  resetMockDb,
  useMockDb,
} from '@/features/mock/store';
import type { MockSettings } from '@/features/mock/types';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { downloadText } from '@/lib/csv';
import { formatThaiDate, todayIso } from '@/lib/dayjs';
import { formatBaht, formatNumber } from '@/lib/format';
import { notifyDone } from '@/lib/notify';

/** Prototype only: manage the browser-stored mock dataset used by every page */
export const Route = createFileRoute('/_app/master/mock-data')({
  component: MockDataPage,
});

type Pending = 'regenerate' | 'clear' | 'reset' | null;

function onImport(file: File | null) {
  if (!file) return;
  void file.text().then((text) => {
    if (importMockDb(text)) {
      notifyDone(`นำเข้าข้อมูล Mockup จาก ${file.name} แล้ว`);
    } else {
      notifyDone('ไฟล์ไม่ใช่ข้อมูล Mockup ของระบบนี้ · ไม่ได้นำเข้า');
    }
  });
}

function MockDataPage() {
  const db = useMockDb();
  const [settings, setSettings] = useState<MockSettings>(db.settings);
  const [pending, setPending] = useState<Pending>(null);
  const counts = statusCounts(db.orders);
  const sales = db.orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const validRange =
    settings.from <= settings.to &&
    settings.minPerDay >= 0 &&
    settings.maxPerDay >= settings.minPerDay;

  return (
    <Stack>
      <PageHeader
        title="ข้อมูล Mockup"
        description="ข้อมูลตัวอย่างสำหรับทดสอบและนำเสนอ ก่อนมี Database จริง"
        actions={
          <>
            <FileButton onChange={onImport} accept="application/json,.json">
              {(props) => (
                <Button variant="default" leftSection={<IconDatabaseImport size={16} />} {...props}>
                  นำเข้า JSON
                </Button>
              )}
            </FileButton>
            <Button
              variant="default"
              leftSection={<IconDatabaseExport size={16} />}
              onClick={() =>
                downloadText(
                  `sahasa-mockup-${todayIso()}-seed${db.settings.seed}.json`,
                  exportMockDb(),
                  'application/json',
                )
              }
            >
              ส่งออก JSON
            </Button>
          </>
        }
      />
      <Alert color="blue" variant="light">
        ข้อมูลทั้งหมดเก็บอยู่ในเบราว์เซอร์นี้ (localStorage) · ทุกหน้าใช้ข้อมูลชุดเดียวกัน และการกดยืนยัน/ยกเลิก/รับ
        Order/บันทึก Tracking ฯลฯ จะถูกบันทึกจริงในชุดนี้ · เปิดคนละเครื่องหรือคนละเบราว์เซอร์จะได้คนละชุด ใช้
        &quot;ส่งออก JSON&quot; แล้ว &quot;นำเข้า JSON&quot; เพื่อย้ายข้อมูลชุดเดียวกันไปอีกเครื่อง
      </Alert>

      <StatGrid
        items={[
          { label: 'Order ทั้งหมด', value: formatNumber(db.orders.length), color: 'blue' },
          { label: 'ยอดขาย (ไม่รวมยกเลิก)', value: formatBaht(sales), color: 'green' },
          { label: 'ลูกค้า', value: formatNumber(db.customers.length), color: 'gray' },
          { label: 'เอกสารบัญชี', value: formatNumber(db.documents.length), color: 'gold' },
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <SectionCard title="ชุดข้อมูลปัจจุบัน">
          <Stack gap={6}>
            <KeyValue label="สถานะ">
              {db.cleared ? 'ล้างข้อมูลแล้ว (เหลือข้อมูลหลัก)' : 'ข้อมูลตัวอย่าง'}
            </KeyValue>
            <KeyValue label="ช่วงวันที่">
              {formatThaiDate(db.settings.from)} – {formatThaiDate(db.settings.to)}
            </KeyValue>
            <KeyValue label="Order ต่อวัน">
              {db.settings.minPerDay}–{db.settings.maxPerDay} รายการ
            </KeyValue>
            <KeyValue label="Seed">
              <Text span ff="monospace" size="sm">
                {db.settings.seed}
              </Text>
            </KeyValue>
            <KeyValue label="สร้างเมื่อ">
              {formatThaiDate(db.generatedAt, 'D MMM BBBB HH:mm')}
            </KeyValue>
            <Table mt="xs">
              <Table.Tbody>
                {ORDER_STATUSES.filter((k) => counts[k] > 0).map((k) => (
                  <Table.Tr key={k}>
                    <Table.Td>
                      <OrderStatusBadge status={k} />
                    </Table.Td>
                    <Table.Td ta="right">{formatNumber(counts[k])}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Text size="xs" c="dimmed">
              สถานะของแต่ละ Order คิดจากรอบส่งเทียบกับวันนี้ ({formatThaiDate(todayIso())}) ณ ตอนที่สร้างข้อมูล ·
              รอบที่ยังไม่ถึงเป็น &quot;รอตรวจสอบ/ยืนยันแล้ว&quot; รอบที่ผ่านมาแล้วส่วนใหญ่ &quot;จัดส่งสำเร็จ&quot;
            </Text>
          </Stack>
        </SectionCard>

        <SectionCard title="สร้างข้อมูลใหม่">
          <Stack>
            <DatePickerInput
              type="range"
              label="ช่วงวันที่สั่ง"
              valueFormat="D MMM BBBB"
              monthLabelFormat="MMMM BBBB"
              yearLabelFormat="BBBB"
              value={[settings.from, settings.to]}
              onChange={([from, to]) => {
                if (from && to) setSettings({ ...settings, from, to });
              }}
              allowSingleDateInRange
            />
            <SimpleGrid cols={2}>
              <NumberInput
                label="Order ต่อวัน (ต่ำสุด)"
                min={0}
                max={200}
                value={settings.minPerDay}
                onChange={(v) => setSettings({ ...settings, minPerDay: Number(v) || 0 })}
              />
              <NumberInput
                label="Order ต่อวัน (สูงสุด)"
                min={0}
                max={200}
                value={settings.maxPerDay}
                onChange={(v) => setSettings({ ...settings, maxPerDay: Number(v) || 0 })}
              />
            </SimpleGrid>
            <Group align="flex-end" gap="xs">
              <NumberInput
                label="Seed"
                description="seed เดิม = ได้ข้อมูลชุดเดิม (ถ้าสร้างวันเดียวกัน)"
                value={settings.seed}
                onChange={(v) => setSettings({ ...settings, seed: Number(v) || 1 })}
                flex={1}
              />
              <Button
                variant="default"
                onClick={() => setSettings({ ...settings, seed: randomSeed() })}
              >
                สุ่ม seed
              </Button>
            </Group>
            <Group justify="space-between" mt="xs">
              <Button variant="subtle" color="gray" onClick={() => setPending('reset')}>
                ค่าเริ่มต้น (1–30 พ.ย., {DEFAULT_SETTINGS.minPerDay}–{DEFAULT_SETTINGS.maxPerDay}/วัน)
              </Button>
              <Button
                leftSection={<IconRefresh size={16} />}
                disabled={!validRange}
                onClick={() => setPending('regenerate')}
              >
                สร้างข้อมูลใหม่
              </Button>
            </Group>
          </Stack>
        </SectionCard>
      </SimpleGrid>

      <Paper withBorder radius="lg" p="md">
        <Group justify="space-between">
          <div>
            <Text fw={600}>ล้างข้อมูลทั้งหมด</Text>
            <Text size="sm" c="dimmed">
              ลบ Order เอกสารบัญชี ใบลดหนี้ ยอดโอน Log และสต็อกทั้งหมด · เก็บสินค้า ลูกค้า ขนส่ง และผู้ใช้ไว้
              เพื่อทดสอบสร้าง Order เองตั้งแต่ศูนย์
            </Text>
          </div>
          <Button
            color="brand"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={() => setPending('clear')}
          >
            ล้างข้อมูล
          </Button>
        </Group>
      </Paper>

      <ConfirmModal
        opened={pending !== null}
        onClose={() => setPending(null)}
        title={
          pending === 'clear'
            ? 'ล้างข้อมูลทั้งหมด?'
            : pending === 'reset'
              ? 'สร้างข้อมูลค่าเริ่มต้น?'
              : 'สร้างข้อมูลใหม่?'
        }
        confirmLabel={pending === 'clear' ? 'ล้างข้อมูล' : 'สร้างข้อมูล'}
        confirmColor={pending === 'clear' ? 'brand' : undefined}
        size="md"
        doneMessage={pending === 'clear' ? 'ล้างข้อมูลแล้ว' : 'สร้างข้อมูล Mockup ใหม่แล้ว'}
        onConfirm={() => {
          if (pending === 'clear') clearMockDb();
          else if (pending === 'reset') {
            resetMockDb();
            setSettings(DEFAULT_SETTINGS);
          } else regenerateMockDb(settings);
        }}
      >
        <Text size="sm">
          ข้อมูลชุดปัจจุบันในเบราว์เซอร์นี้ ({formatNumber(db.orders.length)} Order) รวมถึงสิ่งที่ทดสอบไว้
          จะถูกแทนที่และย้อนกลับไม่ได้ · ถ้าต้องการเก็บไว้ ให้กด &quot;ส่งออก JSON&quot; ก่อน
        </Text>
      </ConfirmModal>
    </Stack>
  );
}
