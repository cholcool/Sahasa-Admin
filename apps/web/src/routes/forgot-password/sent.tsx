import { Alert, Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconMailCheck } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { formatCountdown } from '@/features/auth/session-timeout';

/** 01-03 Reset link sent */
export const Route = createFileRoute('/forgot-password/sent')({
  component: ResetLinkSentPage,
});

const RESEND_COOLDOWN = 45;

function ResetLinkSentPage() {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const ticker = useInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000, {
    autoInvoke: true,
  });

  useEffect(() => ticker.stop, [ticker]);

  const resend = () => {
    // TODO: call the reset-password API again
    notifications.show({ message: 'ส่งลิงก์อีกครั้งแล้ว', color: 'green' });
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <AuthLayout>
      <ThemeIcon size={56} radius="xl" color="green" variant="light">
        <IconMailCheck size={28} />
      </ThemeIcon>
      <Stack gap={2}>
        <Title order={2}>ตรวจสอบอีเมลของคุณ</Title>
        <Text c="dimmed">เราส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่ s***@sahasa.co.th แล้ว ลิงก์มีอายุ 30 นาที</Text>
      </Stack>
      <Alert color="gold" variant="light">
        ไม่พบอีเมล? ตรวจสอบในโฟลเดอร์ Junk/Spam
      </Alert>
      <Button size="md" variant="default" fullWidth disabled={cooldown > 0} onClick={resend}>
        {cooldown > 0 ? `ส่งอีกครั้ง (${formatCountdown(cooldown)})` : 'ส่งอีกครั้ง'}
      </Button>
      <Button variant="subtle" component={Link} to="/reset-password">
        ดูหน้าตั้งรหัสผ่านใหม่ (เมื่อกดลิงก์ในอีเมล)
      </Button>
      <Button variant="subtle" component={Link} to="/login">
        กลับไปหน้าเข้าสู่ระบบ
      </Button>
    </AuthLayout>
  );
}
