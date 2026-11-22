import { Group, Progress, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './ui.module.css';

export interface BarItem {
  label: string;
  value: number;
  /** Text shown on the right; defaults to the value */
  display?: ReactNode;
}

/** Horizontal bars scaled to the largest value (prototype "div.bar") */
export function BarList({ items, color = 'brand' }: { items: BarItem[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Stack gap="sm">
      {items.map((i) => (
        <Group key={i.label} gap="sm" wrap="nowrap">
          <Text size="sm" className={classes.barLabel} truncate>
            {i.label}
          </Text>
          <Progress value={(i.value / max) * 100} color={color} size="md" radius="xl" flex={1} />
          <Text size="sm" fw={600} className={classes.barValue}>
            {i.display ?? i.value}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}
