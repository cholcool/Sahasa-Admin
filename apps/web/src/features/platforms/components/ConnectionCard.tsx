import { Avatar, Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { KeyValue } from '@/components/ui/KeyValue';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface ConnectionInfo {
  name: string;
  subtitle: string;
  status: { label: string; color: string };
  details: [string, string][];
}

/** Platform / carrier connection card (prototype "div.ccard") */
export function ConnectionCard({ info, actions }: { info: ConnectionInfo; actions: ReactNode }) {
  return (
    <Paper withBorder radius="lg" p="md">
      <Stack gap="sm" h="100%">
        <Group wrap="nowrap">
          <Avatar color="brand" radius="md">
            {info.name.charAt(0)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Title order={5}>{info.name}</Title>
            <Text size="xs" c="dimmed">
              {info.subtitle}
            </Text>
          </div>
          <StatusBadge color={info.status.color}>{info.status.label}</StatusBadge>
        </Group>
        <Stack gap={4} flex={1}>
          {info.details.map(([k, v]) => (
            <KeyValue key={k} label={k}>
              {v}
            </KeyValue>
          ))}
        </Stack>
        <Group gap="xs">{actions}</Group>
      </Stack>
    </Paper>
  );
}
