import {
  Alert,
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconLock, IconMail } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';

interface LoginFormProps {
  /** Show the "session expired" banner (prototype 01-05) */
  expired?: boolean;
  defaultEmail?: string;
}

// TODO: wire to Better Auth (email/password) in apps/api
export function LoginForm({ expired, defaultEmail }: LoginFormProps) {
  const navigate = useNavigate();
  return (
    <>
      <Stack gap={2}>
        <Title order={2}>เข้าสู่ระบบ</Title>
        <Text c="dimmed">ระบบจัดการออเดอร์ สหัสา</Text>
      </Stack>
      {expired && (
        <Alert color="orange" variant="light">
          เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง
        </Alert>
      )}
      <TextInput
        label="อีเมล"
        type="email"
        placeholder="name@sahasa.co.th"
        defaultValue={defaultEmail}
        leftSection={<IconMail size={16} />}
      />
      <PasswordInput label="รหัสผ่าน" placeholder="กรอกรหัสผ่าน" leftSection={<IconLock size={16} />} />
      {!expired && (
        <Group justify="flex-end">
          <Anchor component={Link} to="/forgot-password" size="sm">
            ลืมรหัสผ่าน?
          </Anchor>
        </Group>
      )}
      <Button size="md" fullWidth onClick={() => void navigate({ to: '/' })}>
        เข้าสู่ระบบ
      </Button>
      {!expired && (
        <Text size="sm" c="dimmed">
          ระบบจะออกจากระบบอัตโนมัติเมื่อไม่มีการใช้งานตามเวลาที่กำหนด
        </Text>
      )}
    </>
  );
}
