import { Box, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconAlertTriangle, IconChevronRight } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import classes from './ui.module.css';

export interface AlertItemProps {
  title: ReactNode;
  description?: ReactNode;
  /** Mantine color name: brand (red) | orange | gold | blue | green */
  color?: string;
  to?: string;
  onClick?: () => void;
}

/** Clickable alert row used on dashboards and the notification center */
export function AlertItem({ title, description, color = 'orange', to, onClick }: AlertItemProps) {
  const bg = `var(--mantine-color-${color}-light)`;
  const content = (
    <>
      <ThemeIcon color={color} variant="light" radius="xl">
        <IconAlertTriangle size={16} />
      </ThemeIcon>
      <Box flex={1} miw={0}>
        <Text fw={600} size="sm">
          {title}
        </Text>
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </Box>
      <IconChevronRight size={16} />
    </>
  );
  if (to) {
    return (
      <UnstyledButton component={Link} to={to} className={classes.alert} bg={bg}>
        {content}
      </UnstyledButton>
    );
  }
  return (
    <UnstyledButton onClick={onClick} className={classes.alert} bg={bg}>
      {content}
    </UnstyledButton>
  );
}
