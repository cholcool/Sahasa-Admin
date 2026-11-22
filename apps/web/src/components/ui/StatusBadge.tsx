import { Badge } from '@mantine/core';
import type { ReactNode } from 'react';

/** Soft badge for any status text; pass a Mantine color name */
export function StatusBadge({ color = 'gray', children }: { color?: string; children: ReactNode }) {
  return (
    <Badge color={color} variant="light" radius="xl" tt="none" fw={500}>
      {children}
    </Badge>
  );
}
