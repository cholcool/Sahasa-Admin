import { Group, Text } from '@mantine/core';
import type { ReactNode } from 'react';

/** Label on the left, value on the right (prototype "div.kv") */
export function KeyValue({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="sm">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" ta="right" component="div">
        {children}
      </Text>
    </Group>
  );
}
