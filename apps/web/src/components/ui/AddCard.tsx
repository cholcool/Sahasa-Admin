import { Stack, Text, UnstyledButton } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import classes from './ui.module.css';

/** Dashed "add new" tile for card grids */
export function AddCard({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint?: ReactNode;
  onClick: () => void;
}) {
  return (
    <UnstyledButton onClick={onClick} className={classes.addCard}>
      <Stack align="center" gap={4}>
        <IconPlus size={24} />
        <Text fw={600}>{label}</Text>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
    </UnstyledButton>
  );
}
