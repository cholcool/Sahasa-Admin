import { Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/')({
  component: () => <Title order={2}>แดชบอร์ด</Title>,
});
