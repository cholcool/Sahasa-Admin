import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useIdle, useInterval } from '@mantine/hooks';
import { IconClock } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { formatCountdown, IDLE_TIMEOUT_MS, WARNING_SECONDS } from '@/features/auth/session-timeout';

/**
 * Warns before auto-logout after the user has been idle (prototype 01-06).
 * Any mouse/keyboard activity clears `idle`, which unmounts the warning and resets the countdown.
 */
export function SessionTimeoutModal() {
  const idle = useIdle(IDLE_TIMEOUT_MS, { initialState: false });
  return idle ? <TimeoutWarning /> : null;
}

function TimeoutWarning() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

  const logout = () => {
    // TODO: call logout API before redirecting
    void navigate({ to: '/session-expired' });
  };

  useInterval(
    () => {
      if (secondsLeft <= 1) logout();
      setSecondsLeft((s) => s - 1);
    },
    1000,
    { autoInvoke: true },
  );

  return (
    <Modal opened onClose={() => setSecondsLeft(WARNING_SECONDS)} title="แจ้งเตือนเซสชัน" centered>
      <Stack align="center" ta="center" gap="xs">
        <ThemeIcon size={64} radius="xl" color="gold" variant="light">
          <IconClock size={32} />
        </ThemeIcon>
        <Title order={3}>ใกล้หมดเวลาใช้งาน</Title>
        <Text c="dimmed">ไม่มีการใช้งานเป็นเวลานาน ระบบจะออกจากระบบอัตโนมัติใน</Text>
        <Text fz={36} fw={700} c="brand" ff="monospace">
          {formatCountdown(secondsLeft)}
        </Text>
      </Stack>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={logout}>
          ออกจากระบบ
        </Button>
        {/* Clicking is user activity, so useIdle resets and the warning closes */}
        <Button>ใช้งานต่อ</Button>
      </Group>
    </Modal>
  );
}
