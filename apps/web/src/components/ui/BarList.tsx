import { Group, Progress, Stack, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link, type LinkProps } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import classes from './ui.module.css';

export interface BarItem {
  label: string;
  value: number;
  /** Text shown on the right; defaults to the value */
  display?: ReactNode;
  /** Where the row links to, e.g. linkOptions({ to: '/orders', search: {...} }) */
  link?: LinkProps;
}

/** Horizontal bars scaled to the largest value (prototype "div.bar"). Rows with `link` are links */
export function BarList({ items, color = 'brand' }: { items: BarItem[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const hasLinks = items.some((i) => i.link);
  return (
    <Stack gap={hasLinks ? 4 : 'sm'}>
      {items.map((i) => {
        const row = (
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" className={classes.barLabel} truncate>
              {i.label}
            </Text>
            <Progress value={(i.value / max) * 100} color={color} size="md" radius="xl" flex={1} />
            <Text size="sm" fw={600} className={classes.barValue}>
              {i.display ?? i.value}
            </Text>
            {hasLinks && (
              <IconChevronRight
                size={16}
                className={classes.barChevron}
                style={{ visibility: i.link ? 'visible' : 'hidden' }}
                aria-hidden
              />
            )}
          </Group>
        );
        if (!i.link) {
          return (
            <div key={i.label} className={hasLinks ? classes.barRow : undefined}>
              {row}
            </div>
          );
        }
        return (
          <Link
            key={i.label}
            {...i.link}
            className={classes.barRow}
            aria-label={`${i.label} ${typeof i.display === 'string' ? i.display : i.value} — ดูรายการ`}
          >
            {row}
          </Link>
        );
      })}
    </Stack>
  );
}
