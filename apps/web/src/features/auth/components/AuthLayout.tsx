import { ActionIcon, Box, Paper, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import classes from './AuthLayout.module.css';

/** Red brand panel on the left (top on mobile) + form card (prototype 01-xx) */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  return (
    <Box className={classes.root}>
      <ActionIcon
        variant="default"
        radius="xl"
        size="lg"
        className={classes.themeBtn}
        onClick={toggleColorScheme}
        aria-label="สลับโหมดสี"
      >
        {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
      <Stack className={classes.brand} align="center" justify="center" gap="xs">
        <Text className={classes.logo}>สหัสา</Text>
        <Text className={classes.logoSub}>Sahasa</Text>
        <Text fz={18} fw={600}>
          ระบบจัดการออเดอร์
        </Text>
        <Text size="sm" c="gold.3">
          เต้าหู้คลองแงะ · รวมออเดอร์ทุกช่องทางไว้ที่เดียว
        </Text>
      </Stack>
      <Box className={classes.formSide}>
        <Paper withBorder radius="lg" p="xl" className={classes.card}>
          <Stack gap="md">{children}</Stack>
        </Paper>
      </Box>
    </Box>
  );
}
