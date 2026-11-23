import {
  Button,
  Grid,
  Group,
  Indicator,
  Paper,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertTriangle, IconCash, IconPlugConnectedX, IconTag } from '@tabler/icons-react';
import { CHANNELS } from '@sahasa/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { EditedAfterAcceptModal } from '@/features/factory/components/FactoryModals';
import { nowThai } from '@/features/mock/actions';
import { useMockDb } from '@/features/mock/store';
import type { MockDb, MockOrder } from '@/features/mock/types';
import { CHANNEL_LABEL_TH } from '@/features/orders/labels';
import { dayjs, formatThaiDate } from '@/lib/dayjs';
import { notifyDone } from '@/lib/notify';

/** 10-04 Notification center (SRS 63) */
export const Route = createFileRoute('/_app/users/notifications')({
  component: NotificationsPage,
});

type Kind = 'sku' | 'api' | 'ord' | 'pay';

const KIND: Record<Kind, { label: string; color: string; icon: typeof IconTag }> = {
  sku: { label: 'SKU', color: 'orange', icon: IconTag },
  api: { label: 'API error', color: 'brand', icon: IconPlugConnectedX },
  ord: { label: 'Order แก้ไข/ยกเลิก', color: 'blue', icon: IconAlertTriangle },
  pay: { label: 'รับเงิน', color: 'gold', icon: IconCash },
};

const KINDS: Kind[] = ['sku', 'api', 'ord', 'pay'];

type Action =
  | { label: string; to: '/platforms/unmapped-sku' | '/platforms/logs' }
  | { label: string; order: MockOrder };

interface Notice {
  id: string;
  kind: Kind;
  title: string;
  detail: string;
  ago: string;
  unread: boolean;
  action?: Action;
}

function ago(at: string, now: string): string {
  const mins = Math.max(0, dayjs(now).diff(dayjs(at), 'minute'));
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)} ชม. ที่แล้ว`;
  return `${Math.floor(mins / 60 / 24)} วันที่แล้ว`;
}

/** Notifications derived from the current mock data */
function buildNotices(db: MockDb, now: string): Notice[] {
  const list: (Notice & { at: string })[] = [];
  const recent = (at: string) => dayjs(now).diff(dayjs(at), 'hour') < 24;
  const sku = db.unmappedSkus;
  const lastSku = sku
    .map((u) => u.at)
    .toSorted()
    .at(-1);
  if (sku.length > 0 && lastSku) {
    list.push({
      id: 'sku',
      kind: 'sku',
      title: `SKU จับคู่ไม่ได้ ${sku.length} รายการ`,
      detail: sku.map((u) => `${u.platform} ${u.sku}`).join(' · '),
      at: lastSku,
      ago: '',
      unread: true,
      action: { label: 'จับคู่', to: '/platforms/unmapped-sku' },
    });
  }
  for (const l of db.platformLogs.filter((x) => !x.ok && x.at <= now).slice(0, 3)) {
    list.push({
      id: l.id,
      kind: 'api',
      title: `API error: ${l.platform}`,
      detail: `${l.action}ไม่สำเร็จ ${formatThaiDate(l.at, 'D MMM HH:mm')} · ${l.message}`,
      at: l.at,
      ago: '',
      unread: recent(l.at),
      action: { label: 'ดู Log', to: '/platforms/logs' },
    });
  }
  for (const o of db.orders) {
    const edit = o.editedAfterAccept
      ? o.history.filter((h) => h.type === 'edited').at(-1)
      : undefined;
    if (edit && edit.at <= now) {
      list.push({
        id: `e-${o.orderNumber}`,
        kind: 'ord',
        title: 'Order ถูกแก้ไขหลังโรงงานรับ',
        detail: `${o.orderNumber} · ${edit.text}`,
        at: edit.at,
        ago: '',
        unread: recent(edit.at),
        action: { label: 'ดู', order: o },
      });
    }
    if (o.status === 'cancelled' && o.acceptedAt && o.cancelledAt && o.cancelledAt <= now) {
      list.push({
        id: `c-${o.orderNumber}`,
        kind: 'ord',
        title: 'Order ถูกยกเลิกหลังโรงงานรับ',
        detail: `${o.orderNumber} · ${o.cancelReason ?? ''}`,
        at: o.cancelledAt,
        ago: '',
        unread: recent(o.cancelledAt),
      });
    }
  }
  const awaiting = db.orders.filter(
    (o) => o.payment === 'awaiting' && o.status !== 'cancelled' && o.orderedAt <= now,
  );
  const lastAwaiting = awaiting
    .map((o) => o.orderedAt)
    .toSorted()
    .at(-1);
  if (lastAwaiting) {
    const by = CHANNELS.map((c) => [c, awaiting.filter((o) => o.channel === c).length] as const)
      .filter(([, n]) => n > 0)
      .map(([c, n]) => `${CHANNEL_LABEL_TH[c]} ${n}`)
      .join(' · ');
    list.push({
      id: 'pay',
      kind: 'pay',
      title: `Order Manual รอยืนยันรับเงิน ${awaiting.length} รายการ`,
      detail: by,
      at: lastAwaiting,
      ago: '',
      unread: recent(lastAwaiting),
    });
  }
  return list
    .toSorted((x, y) => y.at.localeCompare(x.at))
    .slice(0, 30)
    .map((n) => ({ ...n, ago: ago(n.at, now) }));
}

const RECIPIENTS = [
  { type: 'SKU จับคู่ไม่ได้', admin: true, factory: false, acc: false },
  { type: 'API error', admin: true, factory: false, acc: false },
  { type: 'แก้ไข/ยกเลิกหลังรับ', admin: true, factory: true, acc: false },
  { type: 'Order แทรกหลังตัดรอบ', admin: true, factory: true, acc: false },
  { type: 'รอยืนยันรับเงิน', admin: true, factory: false, acc: true },
];

function NotificationsPage() {
  const [tab, setTab] = useState<string | null>('all');
  const [readAll, setReadAll] = useState(false);
  const [flagged, setFlagged] = useState<MockOrder | null>(null);
  const db = useMockDb();
  const NOTICES = buildNotices(db, nowThai());
  const rows = NOTICES.filter((n) => tab === 'all' || n.kind === tab);
  const count = (k: Kind) => NOTICES.filter((n) => n.kind === k).length;

  return (
    <Stack>
      <PageHeader
        title="ศูนย์แจ้งเตือน"
        description="รวมการแจ้งเตือนของระบบไว้ที่เดียว"
        actions={
          <Button
            variant="default"
            onClick={() => {
              setReadAll(true);
              notifyDone('ทำเครื่องหมายอ่านแล้วทั้งหมด');
            }}
          >
            อ่านทั้งหมดแล้ว
          </Button>
        }
      />
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder radius="lg" p="md">
            <Tabs value={tab} onChange={setTab} mb="sm">
              <Tabs.List>
                <Tabs.Tab value="all">ทั้งหมด ({NOTICES.length})</Tabs.Tab>
                {KINDS.map((k) => (
                  <Tabs.Tab key={k} value={k}>
                    {KIND[k].label} ({count(k)})
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
            <Stack gap={0}>
              {rows.map((n) => {
                const Icon = KIND[n.kind].icon;
                const unread = n.unread && !readAll;
                return (
                  <Group
                    key={n.id}
                    wrap="nowrap"
                    align="flex-start"
                    py="sm"
                    style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
                  >
                    <Indicator disabled={!unread} color="brand" size={8} offset={2}>
                      <ThemeIcon variant="light" color={KIND[n.kind].color} radius="xl">
                        <Icon size={16} />
                      </ThemeIcon>
                    </Indicator>
                    <div style={{ flex: 1 }}>
                      <Text fw={unread ? 700 : 500} size="sm">
                        {n.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {n.detail}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {n.ago}
                      </Text>
                    </div>
                    {n.action &&
                      ('to' in n.action ? (
                        <Button
                          size="compact-xs"
                          variant="default"
                          component={Link}
                          to={n.action.to}
                        >
                          {n.action.label}
                        </Button>
                      ) : (
                        <Button
                          size="compact-xs"
                          variant="default"
                          onClick={() => {
                            if (n.action && 'order' in n.action) setFlagged(n.action.order);
                          }}
                        >
                          {n.action.label}
                        </Button>
                      ))}
                  </Group>
                );
              })}
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SectionCard title="ใครได้รับแจ้งเตือน">
            <Table.ScrollContainer minWidth={300}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ประเภท</Table.Th>
                    <Table.Th ta="center">Admin</Table.Th>
                    <Table.Th ta="center">โรงงาน</Table.Th>
                    <Table.Th ta="center">บัญชี</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {RECIPIENTS.map((r) => (
                    <Table.Tr key={r.type}>
                      <Table.Td>
                        <Text size="sm">{r.type}</Text>
                      </Table.Td>
                      {(['admin', 'factory', 'acc'] as const).map((k) => (
                        <Table.Td key={k}>
                          <Switch
                            size="xs"
                            mx="auto"
                            w="fit-content"
                            defaultChecked={r[k]}
                            aria-label={`${r.type} · ${k}`}
                          />
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </SectionCard>
        </Grid.Col>
      </Grid>
      <EditedAfterAcceptModal
        opened={flagged !== null}
        onClose={() => setFlagged(null)}
        order={flagged}
      />
    </Stack>
  );
}
