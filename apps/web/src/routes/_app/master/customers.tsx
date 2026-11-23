import {
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CHANNELS } from '@sahasa/shared';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useMockDb } from '@/features/mock/store';
import type { MockCustomer } from '@/features/mock/types';
import { NewCustomerModal } from '@/features/orders/components/CustomerModals';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { formatThaiDate } from '@/lib/dayjs';
import { formatBaht } from '@/lib/format';

/** 08-03 Customers across channels (SRS 52) */
export const Route = createFileRoute('/_app/master/customers')({
  component: CustomersPage,
});

const PAGE_SIZE = 25;

function CustomersPage() {
  const db = useMockDb();
  const [viewing, setViewing] = useState<MockCustomer | null>(null);
  const [newOpened, newCustomer] = useDisclosure(false);
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState<string | null>(null);
  const [billing, setBilling] = useState<string | null>('all');
  const [page, setPage] = useState(1);

  // Order count, total and last order per customer
  const stats = useMemo(() => {
    const map = new Map<string, { count: number; total: number; last: string }>();
    for (const o of db.orders) {
      if (o.status === 'cancelled') continue;
      const s = map.get(o.customerId) ?? { count: 0, total: 0, last: '' };
      s.count += 1;
      s.total += o.total;
      if (o.orderDate > s.last) s.last = o.orderDate;
      map.set(o.customerId, s);
    }
    return map;
  }, [db.orders]);

  const query = q.trim().toLowerCase().replace(/-/g, '');
  const rows = db.customers
    .filter(
      (c) =>
        (!channel || c.channel === channel) &&
        (billing === 'all' || c.billing === billing) &&
        (!query ||
          c.name.toLowerCase().includes(query) ||
          c.phone.replace(/-/g, '').includes(query) ||
          (c.taxId ?? '').includes(query)),
    )
    .toSorted((a, b) => (stats.get(b.id)?.last ?? '').localeCompare(stats.get(a.id)?.last ?? ''));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const viewStats = viewing ? stats.get(viewing.id) : undefined;

  return (
    <Stack>
      <PageHeader
        title="ลูกค้า"
        description="ลูกค้าทุกช่องทาง · 1 คนมีได้หลายเบอร์ หลายที่อยู่ หลายชุดใบกำกับ"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={newCustomer.open}>
            เพิ่มลูกค้า
          </Button>
        }
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={240}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาชื่อ, เบอร์โทร, เลขผู้เสียภาษี"
              value={q}
              onChange={(e) => {
                setQ(e.currentTarget.value);
                setPage(1);
              }}
            />
            <Select
              aria-label="ช่องทาง"
              placeholder="ทุกช่องทาง"
              clearable
              data={CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL_TH[c] }))}
              value={channel}
              onChange={(v) => {
                setChannel(v);
                setPage(1);
              }}
            />
            <Select
              aria-label="ประเภทบิล"
              data={[
                { value: 'all', label: 'VAT และ NOVAT' },
                { value: 'VAT', label: 'VAT' },
                { value: 'NOVAT', label: 'NOVAT' },
              ]}
              value={billing}
              onChange={(v) => {
                setBilling(v ?? 'all');
                setPage(1);
              }}
              allowDeselect={false}
            />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            minHeight={200}
            idAccessor="id"
            records={pageRows}
            totalRecords={rows.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            paginationText={({ from, to, totalRecords }) => `${from}–${to} จาก ${totalRecords}`}
            noRecordsText="ไม่พบลูกค้า"
            columns={[
              {
                accessor: 'name',
                title: 'ชื่อลูกค้า',
                render: (r) => (
                  <Text fw={700} size="sm">
                    {r.name}
                  </Text>
                ),
              },
              { accessor: 'phone', title: 'เบอร์หลัก' },
              { accessor: 'channel', title: 'ช่องทาง', render: (r) => CHANNEL_LABEL_TH[r.channel] },
              {
                accessor: 'billing',
                title: 'บิล',
                render: (r) => (
                  <StatusBadge color={r.billing === 'VAT' ? 'blue' : 'gray'}>
                    {r.billing}
                  </StatusBadge>
                ),
              },
              {
                accessor: 'addresses',
                title: 'ที่อยู่',
                textAlign: 'right',
                render: (r) => r.addresses.length,
              },
              {
                accessor: 'orders',
                title: 'Order',
                textAlign: 'right',
                render: (r) => stats.get(r.id)?.count ?? 0,
              },
              {
                accessor: 'lastOrder',
                title: 'Order ล่าสุด',
                render: (r) => {
                  const last = stats.get(r.id)?.last;
                  return last ? formatThaiDate(last, 'D MMM') : '—';
                },
              },
              {
                accessor: 'actions',
                title: '',
                textAlign: 'right',
                render: (r) => (
                  <Button size="compact-xs" variant="default" onClick={() => setViewing(r)}>
                    ดู
                  </Button>
                ),
              },
            ]}
          />
        </Stack>
      </Paper>

      <ConfirmModal
        opened={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name}
        confirmLabel="แก้ไขข้อมูล"
        doneMessage="เปิดโหมดแก้ไข (ตัวอย่าง)"
        size="xl"
      >
        {viewing && (
          <>
            <Group gap="xs">
              <StatusBadge color={viewing.billing === 'VAT' ? 'blue' : 'gray'}>
                {viewing.billing}
              </StatusBadge>
              <StatusBadge>{CHANNEL_LABEL_TH[viewing.channel]}</StatusBadge>
              <Text size="xs" c="dimmed">
                {viewStats?.count ?? 0} Order · {formatBaht(viewStats?.total ?? 0)}
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Stack gap="xs">
                <ListBlock title="เบอร์โทร" items={[`${viewing.phone} · หลัก`]} />
                <ListBlock
                  title="ข้อมูลใบกำกับภาษี"
                  items={
                    viewing.billing === 'VAT'
                      ? [
                          [
                            `${viewing.name} (สำนักงานใหญ่) · ${viewing.taxId ?? 'ยังไม่มีเลขผู้เสียภาษี'}`,
                            true,
                          ],
                        ]
                      : ['ไม่ออกใบกำกับ (NOVAT)']
                  }
                />
              </Stack>
              <ListBlock
                title="ที่อยู่จัดส่ง"
                items={viewing.addresses.map((a): [string, boolean] => [
                  `${a.name} · ${a.text} · ${a.phone}`,
                  a.isDefault,
                ])}
              />
            </SimpleGrid>
          </>
        )}
      </ConfirmModal>
      <NewCustomerModal
        key={`new-${newOpened}`}
        opened={newOpened}
        onClose={newCustomer.close}
        onCreated={() => undefined}
      />
    </Stack>
  );
}

/** Items: plain text, or [text, isDefault] */
function ListBlock({ title, items }: { title: string; items: (string | [string, boolean])[] }) {
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Title order={5}>{title}</Title>
        <Button size="compact-xs" variant="subtle" leftSection={<IconPlus size={14} />}>
          เพิ่ม
        </Button>
      </Group>
      {items.map((item) => {
        const [text, isDefault] = Array.isArray(item) ? item : [item, false];
        return (
          <Paper key={text} withBorder p="xs" radius="md">
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm">{text}</Text>
              {isDefault && <StatusBadge color="blue">ค่าเริ่มต้น</StatusBadge>}
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
