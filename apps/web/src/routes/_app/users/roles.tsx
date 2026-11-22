import { Alert, Badge, Button, Checkbox, Paper, Stack, Table, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { Fragment, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { buildGrantMatrix, PERMISSIONS, ROLES, toggleGrant } from '@/features/users/roles';
import { notifyDone } from '@/lib/notify';

/** 10-02 Roles and permission matrix (SRS 61, pending) */
export const Route = createFileRoute('/_app/users/roles')({
  component: RolesPage,
});

const GROUPS = [...new Set(PERMISSIONS.map((p) => p.group))];

function RolesPage() {
  const [matrix, setMatrix] = useState(buildGrantMatrix);

  return (
    <Stack>
      <PageHeader
        title="Role และสิทธิ์"
        description="กำหนดสิทธิ์ต่อ Role · ชื่อสิทธิ์แสดงภาษาไทย พร้อมรหัสภาษาอังกฤษสำหรับทีมพัฒนา"
        pending
        actions={
          <>
            <Button variant="default" onClick={() => notifyDone('เพิ่ม Role ใหม่')}>
              เพิ่ม Role
            </Button>
            {/* TODO: save to role_permissions via API */}
            <Button onClick={() => notifyDone('บันทึกสิทธิ์แล้ว')}>บันทึก</Button>
          </>
        }
      />
      <Alert color="orange" variant="light">
        รายชื่อ Role และสิทธิ์ทั้งหมดเป็นร่าง รอยืนยัน (ข้อ 61, Q22, Q41) · ติ๊กเพื่อปรับได้ทันที{' '}
        <Badge size="xs" variant="outline" color="orange">
          รอยืนยัน
        </Badge>
      </Alert>
      <Paper withBorder radius="lg" p="md">
        <Table.ScrollContainer minWidth={720}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>สิทธิ์</Table.Th>
                {ROLES.map((r) => (
                  <Table.Th key={r} ta="center">
                    {r}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {GROUPS.map((group) => (
                <Fragment key={group}>
                  <Table.Tr>
                    <Table.Td
                      colSpan={ROLES.length + 1}
                      fw={700}
                      bg="var(--mantine-color-default-hover)"
                    >
                      {group}
                    </Table.Td>
                  </Table.Tr>
                  {PERMISSIONS.filter((p) => p.group === group).map((p) => (
                    <Table.Tr key={p.code}>
                      <Table.Td>
                        <Text size="sm">{p.label}</Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {p.code}
                        </Text>
                      </Table.Td>
                      {ROLES.map((role) => (
                        <Table.Td key={role}>
                          <Checkbox
                            mx="auto"
                            w="fit-content"
                            checked={matrix[role].has(p.code)}
                            disabled={role === 'Admin'}
                            onChange={() => setMatrix((m) => toggleGrant(m, role, p.code))}
                            aria-label={`${role} · ${p.label}`}
                          />
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Fragment>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Text size="xs" c="dimmed" mt="xs">
          Admin มีทุกสิทธิ์และแก้ไขไม่ได้ · ตารางนี้เลื่อนแนวนอนได้บนมือถือ
        </Text>
      </Paper>
    </Stack>
  );
}
