import {
  Button,
  Checkbox,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ROLE_COLOR, ROLES, type Role } from '@/features/users/roles';

/** 10-01 Users (SRS 60) */
export const Route = createFileRoute('/_app/users/')({
  component: UsersPage,
});

interface UserRow {
  name: string;
  email: string;
  role: Role;
  lastActive: string;
  active: boolean;
}

// TODO: replace with users API (Better Auth)
const USERS: UserRow[] = [
  {
    name: 'คุณเฉิน',
    email: 'owner@sahasa.co.th',
    role: 'Owner',
    lastActive: 'วันนี้ 09:02',
    active: true,
  },
  { name: 'Admin', email: 'admin@sahasa.co.th', role: 'Admin', lastActive: 'ออนไลน์', active: true },
  {
    name: 'Sales01',
    email: 'sales01@sahasa.co.th',
    role: 'Sales',
    lastActive: 'วันนี้ 10:42',
    active: true,
  },
  {
    name: 'หัวหน้า Sales',
    email: 'lead@sahasa.co.th',
    role: 'หัวหน้า',
    lastActive: 'เมื่อวาน',
    active: true,
  },
  {
    name: 'โรงงาน01',
    email: 'factory01@sahasa.co.th',
    role: 'โรงงาน',
    lastActive: 'วันนี้ 08:10',
    active: true,
  },
  {
    name: 'บัญชี01',
    email: 'acc01@sahasa.co.th',
    role: 'บัญชี',
    lastActive: 'วันนี้ 09:30',
    active: true,
  },
  {
    name: 'Sales02',
    email: 'sales02@sahasa.co.th',
    role: 'Sales',
    lastActive: '30 ต.ค.',
    active: false,
  },
];

function UsersPage() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRow | 'new' | null>(null);
  const user = editing === 'new' ? undefined : (editing ?? undefined);

  const rows = USERS.filter(
    (u) =>
      (!role || u.role === role) &&
      (!q ||
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <Stack>
      <PageHeader
        title="ผู้ใช้"
        description="เพิ่ม แก้ไข และปิดการใช้งานผู้ใช้"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing('new')}>
            เพิ่มผู้ใช้
          </Button>
        }
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <SearchInput miw={240} placeholder="ค้นหาชื่อหรืออีเมล" value={q} onSearch={setQ} />
            <Select
              placeholder="ทุก Role"
              clearable
              data={[...ROLES]}
              value={role}
              onChange={setRole}
            />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            idAccessor="email"
            records={rows}
            noRecordsText="ไม่พบผู้ใช้"
            columns={[
              {
                accessor: 'name',
                title: 'ชื่อ',
                render: (r) => (
                  <Text fw={700} size="sm">
                    {r.name}
                  </Text>
                ),
              },
              { accessor: 'email', title: 'อีเมล' },
              {
                accessor: 'role',
                title: 'Role',
                render: (r) => <StatusBadge color={ROLE_COLOR[r.role]}>{r.role}</StatusBadge>,
              },
              { accessor: 'lastActive', title: 'ใช้งานล่าสุด' },
              {
                accessor: 'active',
                title: 'สถานะ',
                render: (r) =>
                  r.active ? (
                    <StatusBadge color="green">ใช้งาน</StatusBadge>
                  ) : (
                    <StatusBadge>ปิดใช้งาน</StatusBadge>
                  ),
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
        </Stack>
      </Paper>

      <ConfirmModal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={user ? `แก้ไขผู้ใช้ · ${user.name}` : 'เพิ่มผู้ใช้'}
        confirmLabel="บันทึก"
        doneMessage={user ? 'บันทึกผู้ใช้แล้ว' : 'เพิ่มผู้ใช้แล้ว · ส่งอีเมลตั้งรหัสผ่าน'}
        size="md"
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} key={user?.email ?? 'new'}>
          <TextInput
            label="ชื่อที่แสดง"
            withAsterisk
            defaultValue={user?.name}
            placeholder="เช่น Sales03"
          />
          <TextInput
            label="อีเมล"
            withAsterisk
            defaultValue={user?.email}
            placeholder="name@sahasa.co.th"
          />
          <Select
            label="Role"
            data={[...ROLES]}
            defaultValue={user?.role ?? 'Sales'}
            style={{ gridColumn: '1 / -1' }}
          />
        </SimpleGrid>
        {!user && <Checkbox defaultChecked label="ส่งอีเมลให้ผู้ใช้ตั้งรหัสผ่านเอง" />}
        <Switch label="เปิดใช้งาน" defaultChecked={user?.active ?? true} />
      </ConfirmModal>
    </Stack>
  );
}
