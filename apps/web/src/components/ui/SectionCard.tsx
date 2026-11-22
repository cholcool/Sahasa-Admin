import { Group, Paper, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Remove inner padding (for full-width tables) */
  flush?: boolean;
}

/** Card with a header row (prototype "section.card") */
export function SectionCard({ title, actions, children, flush }: SectionCardProps) {
  return (
    <Paper withBorder radius="lg" p={flush ? 0 : 'md'}>
      {(title || actions) && (
        <Group justify="space-between" mb="sm" p={flush ? 'md' : 0} pb={flush ? 0 : undefined}>
          {title && <Title order={4}>{title}</Title>}
          {actions && <Group gap="xs">{actions}</Group>}
        </Group>
      )}
      {children}
    </Paper>
  );
}
