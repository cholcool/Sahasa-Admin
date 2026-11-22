import { Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import classes from './ui.module.css';

export interface ColumnDatum {
  label: string;
  value: number;
  /** Highlight (e.g. today, not closed yet) */
  muted?: boolean;
}

/** Lightweight vertical bar chart (no chart library in the stack yet) */
export function ColumnChart({ data, height = 180 }: { data: ColumnDatum[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Group gap={6} align="flex-end" wrap="nowrap" h={height + 24} className={classes.columnChart}>
      {data.map((d) => (
        <Stack key={d.label} gap={4} align="center" flex={1} miw={14}>
          <Tooltip label={`${d.label}: ${d.value}`}>
            <Box
              w="100%"
              h={Math.max(2, (d.value / max) * height)}
              bg={d.muted ? 'brand.2' : 'brand.6'}
              className={classes.column}
            />
          </Tooltip>
          <Text size="10px" c="dimmed">
            {d.label}
          </Text>
        </Stack>
      ))}
    </Group>
  );
}
