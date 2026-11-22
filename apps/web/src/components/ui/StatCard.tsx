import { ColorSwatch, Group, Paper, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import classes from './ui.module.css';

export interface StatItem {
  label: string;
  value: ReactNode;
  /** Mantine color name for the status dot */
  color?: string;
  /** Route to open when clicked */
  to?: string;
  hint?: ReactNode;
}

export function StatCard({ label, value, color, to, hint }: StatItem) {
  const body = (
    <Paper withBorder p="md" radius="lg" className={to ? classes.statLink : undefined} h="100%">
      <Group gap={8} wrap="nowrap">
        {color && (
          <ColorSwatch color={`var(--mantine-color-${color}-6)`} size={10} withShadow={false} />
        )}
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text fz={28} fw={600} className={classes.num} mt={4}>
        {value}
      </Text>
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Paper>
  );
  if (!to) return body;
  return (
    <UnstyledButton component={Link} to={to} display="block">
      {body}
    </UnstyledButton>
  );
}

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: Math.min(items.length, 6) }} spacing="md">
      {items.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </SimpleGrid>
  );
}
