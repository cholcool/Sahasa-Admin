import { Button, Group, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { isStrongPassword, PASSWORD_RULES } from '@/features/auth/password-rules';

/** 01-04 Set a new password (opened from the email link) */
export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = () => {
    // TODO: call the API with the token from the email link
    notifications.show({ message: 'ตั้งรหัสผ่านใหม่แล้ว กรุณาเข้าสู่ระบบ', color: 'green' });
    void navigate({ to: '/login' });
  };

  return (
    <AuthLayout>
      <Stack gap={2}>
        <Title order={2}>ตั้งรหัสผ่านใหม่</Title>
        <Text c="dimmed">สำหรับบัญชี sales01@sahasa.co.th</Text>
      </Stack>
      <PasswordInput
        label="รหัสผ่านใหม่"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
      />
      <PasswordInput
        label="ยืนยันรหัสผ่านใหม่"
        value={confirm}
        onChange={(e) => setConfirm(e.currentTarget.value)}
        error={mismatch ? 'รหัสผ่านไม่ตรงกัน' : undefined}
      />
      <Stack gap={6}>
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <Group key={rule.label} gap={8}>
              {ok ? (
                <IconCheck size={16} color="var(--mantine-color-green-6)" />
              ) : (
                <IconX size={16} />
              )}
              <Text size="sm" c={ok ? 'green' : 'dimmed'}>
                {rule.label}
              </Text>
            </Group>
          );
        })}
      </Stack>
      <Button
        size="md"
        fullWidth
        disabled={!isStrongPassword(password) || password !== confirm}
        onClick={submit}
      >
        บันทึกรหัสผ่านใหม่
      </Button>
    </AuthLayout>
  );
}
