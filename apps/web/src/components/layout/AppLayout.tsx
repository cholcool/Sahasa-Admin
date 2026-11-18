import {
  ActionIcon,
  AppShell,
  Group,
  NavLink,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { Link, Outlet, useMatchRoute } from '@tanstack/react-router';
import classes from './AppLayout.module.css';
import { NAV_ITEMS } from './nav-items';

/**
 * Desktop: sidebar แดง + header ขาว
 * Mobile (< sm): ซ่อน sidebar ใช้ bottom nav แทน (ตาม prototype)
 */
export function AppLayout() {
  const matchRoute = useMatchRoute();
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  // bottom nav แสดงเฉพาะจอเล็กกว่า sm (48em) จอใหญ่ไม่ต้องเว้นที่ให้ footer
  const isMobile = useMediaQuery('(max-width: 48em)');

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: true } }}
      footer={{ height: 64, collapsed: !isMobile }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between">
          <Text fw={600} c="brand">
            Sahasa Admin
          </Text>
          <ActionIcon variant="subtle" onClick={toggleColorScheme} aria-label="สลับโหมดสี">
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" className={classes.navbar}>
        <Stack gap={4}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={!!matchRoute({ to: item.to, fuzzy: item.to !== '/' })}
              className={classes.navLink}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer hiddenFrom="sm">
        <nav className={classes.bottomNav}>
          {NAV_ITEMS.filter((item) => item.mobile).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={classes.bottomItem}
              activeOptions={{ exact: item.to === '/' }}
            >
              <item.icon size={22} />
              {item.label}
            </Link>
          ))}
        </nav>
      </AppShell.Footer>
    </AppShell>
  );
}
