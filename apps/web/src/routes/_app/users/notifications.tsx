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
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle, IconCash, IconPlugConnectedX, IconTag } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { EditedAfterAcceptModal } from '@/features/factory/components/FactoryModals';
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
  | { label: string; modal: true };

interface Notice {
  id: number;
  kind: Kind;
  title: string;
  detail: string;
  ago: string;
  unread: boolean;
  action?: Action;
}

const NOTICES: Notice[] = [
  {
    id: 1,
    kind: 'sku',
    title: 'SKU จับคู่ไม่ได้ 2 รายการ',
    detail: 'Shopee TOFU-10-PROMO · TikTok SAUCE400-NEW · กระทบ 6 Order',
    ago: '5 นาทีที่แล้ว',
    unread: true,
    action: { label: 'จับคู่', to: '/platforms/unmapped-sku' },
  },
  {
    id: 2,
    kind: 'api',
    title: 'API error: Lazada',
    detail: 'ดึงออเดอร์ไม่สำเร็จ 10:45 · Access token หมดอายุ',
    ago: '10 นาทีที่แล้ว',
    unread: true,
    action: { label: 'ดู Log', to: '/platforms/logs' },
  },
  {
    id: 3,
    kind: 'ord',
    title: 'Order ถูกแก้ไขหลังโรงงานรับ',
    detail: 'ORD-000128 · จำนวนเต้าหู้ 4 → 5 · Sales01',
    ago: '20 นาทีที่แล้ว',
    unread: true,
    action: { label: 'ดู', modal: true },
  },
  {
    id: 4,
    kind: 'ord',
    title: 'Order ถูกยกเลิกหลังโรงงานรับ',
    detail: 'ORD-000117 · ลูกค้าขอยกเลิก · Admin',
    ago: '45 นาทีที่แล้ว',
    unread: false,
  },
  {
    id: 5,
    kind: 'pay',
    title: 'Order Manual รอยืนยันรับเงิน 4 รายการ',
    detail: 'Line 3 · Facebook 1',
    ago: '1 ชม. ที่แล้ว',
    unread: false,
  },
  {
    id: 6,
    kind: 'api',
    title: 'API error: Inter Express',
    detail: 'ดึงสถานะขนส่ง timeout · Re-sync สำเร็จแล้ว',
    ago: '2 ชม. ที่แล้ว',
    unread: false,
  },
];

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
  const [flagOpened, flag] = useDisclosure(false);
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
                        <Button size="compact-xs" variant="default" onClick={flag.open}>
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
      <EditedAfterAcceptModal opened={flagOpened} onClose={flag.close} />
    </Stack>
  );
}
