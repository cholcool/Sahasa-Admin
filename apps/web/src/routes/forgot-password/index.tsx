import { Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

/** 01-02 Forgot password */
export const Route = createFileRoute('/forgot-password/')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Stack gap={2}>
        <Title order={2}>ลืมรหัสผ่าน</Title>
        <Text c="dimmed">กรอกอีเมลที่ใช้เข้าสู่ระบบ ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่อีเมลนี้</Text>
      </Stack>
      <TextInput
        label="อีเมล"
        type="email"
        placeholder="name@sahasa.co.th"
        leftSection={<IconMail size={16} />}
      />
      {/* TODO: call the reset-password API */}
      <Button size="md" fullWidth onClick={() => void navigate({ to: '/forgot-password/sent' })}>
        ส่งลิงก์ตั้งรหัสผ่าน
      </Button>
      <Button variant="subtle" component={Link} to="/login">
        กลับไปหน้าเข้าสู่ระบบ
      </Button>
    </AuthLayout>
  );
}
