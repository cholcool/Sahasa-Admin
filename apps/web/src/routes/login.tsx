import { Button, Center, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

// TODO: ต่อ Better Auth (email/password) ฝั่ง apps/api
function LoginPage() {
  return (
    <Center mih="100vh" p="md">
      <Paper w={380} p="xl" shadow="sm">
        <Stack>
          <Title order={3}>เข้าสู่ระบบ</Title>
          <TextInput label="อีเมล" type="email" />
          <PasswordInput label="รหัสผ่าน" />
          <Button fullWidth>เข้าสู่ระบบ</Button>
        </Stack>
      </Paper>
    </Center>
  );
}
