import { Badge, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Requirement not yet confirmed with the client (dashed frame in the prototype) */
  pending?: boolean;
  actions?: ReactNode;
}

export function PageHeader({ title, description, pending, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" gap="sm">
      <Stack gap={2}>
        <Group gap="xs">
          <Title order={2}>{title}</Title>
          {pending && (
            <Badge variant="outline" color="orange" size="sm">
              รอยืนยัน
            </Badge>
          )}
        </Group>
        {description && (
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        )}
      </Stack>
      {actions && <Group gap="xs">{actions}</Group>}
    </Group>
  );
}
