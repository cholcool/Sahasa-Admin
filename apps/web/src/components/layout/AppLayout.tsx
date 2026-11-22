import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  Indicator,
  NavLink,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconBell, IconChevronRight, IconMoon, IconSun } from '@tabler/icons-react';
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { SessionTimeoutModal } from '@/features/auth/components/SessionTimeoutModal';
import classes from './AppLayout.module.css';
import { findNavMatch, NAV_ITEMS } from './nav-items';

/**
 * Desktop: red sidebar with sub-menus + white header with breadcrumb
 * Mobile (< sm): sidebar becomes a drawer (burger), bottom nav + sub-menu tabs on top of the page
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  // Bottom nav is shown below sm (48em) only, so desktop does not reserve footer space
  const isMobile = useMediaQuery('(max-width: 48em)');
  const { item: current, child: currentChild } = findNavMatch(pathname);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 248, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}
      footer={{ height: 64, collapsed: !isMobile }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Text fw={700} c="brand" visibleFrom="sm">
              สหัสา
            </Text>
            <Group gap={6} wrap="nowrap" className={classes.crumb}>
              {current && (
                <Text size="sm" c="dimmed" visibleFrom="sm">
                  {current.label}
                </Text>
              )}
              {current && currentChild && (
                <IconChevronRight size={14} className={classes.crumbSep} />
              )}
              <Text size="sm" fw={600} truncate>
                {currentChild?.label ?? current?.label ?? 'Sahasa Admin'}
              </Text>
            </Group>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon variant="subtle" onClick={toggleColorScheme} aria-label="สลับโหมดสี">
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
            <Indicator color="brand" size={8} offset={4}>
              <ActionIcon
                variant="subtle"
                aria-label="ศูนย์แจ้งเตือน"
                onClick={() => void navigate({ to: '/users/notifications' })}
              >
                <IconBell size={18} />
              </ActionIcon>
            </Indicator>
            <Avatar color="brand" radius="xl" size="sm">
              A
            </Avatar>
            <Text size="sm" fw={500} visibleFrom="sm">
              Admin
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar}>
        <AppShell.Section p="md">
          <Text className={classes.logo}>สหัสา</Text>
          <Text size="xs" className={classes.logoSub}>
            Sahasa
          </Text>
        </AppShell.Section>
        <AppShell.Section grow component={ScrollArea} px="sm" pb="md">
          <Stack gap={2}>
            {NAV_ITEMS.map((item) => {
              const active = current?.to === item.to;
              const label = item.draft ? (
                <Group gap={6}>
                  {item.label}
                  <Badge size="xs" variant="white" color="brand">
                    ร่าง
                  </Badge>
                </Group>
              ) : (
                item.label
              );
              if (!item.children) {
                return (
                  <NavLink
                    key={item.to}
                    component={Link}
                    to={item.to}
                    label={label}
                    leftSection={<item.icon size={18} />}
                    active={active}
                    onClick={closeMobile}
                    className={classes.navLink}
                  />
                );
              }
              return (
                <NavLink
                  key={item.to}
                  label={label}
                  leftSection={<item.icon size={18} />}
                  defaultOpened={active}
                  active={active && !currentChild}
                  className={classes.navLink}
                  childrenOffset={28}
                >
                  {item.children.map((c) => (
                    <NavLink
                      key={c.to}
                      component={Link}
                      to={c.to}
                      label={c.label}
                      active={currentChild?.to === c.to}
                      onClick={closeMobile}
                      className={classes.subLink}
                    />
                  ))}
                </NavLink>
              );
            })}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {current?.children && (
          <Tabs
            value={currentChild?.to ?? null}
            onChange={(to) => to && void navigate({ to })}
            hiddenFrom="sm"
            mb="md"
            variant="pills"
            radius="xl"
          >
            <ScrollArea type="never">
              <Tabs.List className={classes.subTabs}>
                {current.children.map((c) => (
                  <Tabs.Tab key={c.to} value={c.to}>
                    {c.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </ScrollArea>
          </Tabs>
        )}
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer hiddenFrom="sm">
        <nav className={classes.bottomNav}>
          {NAV_ITEMS.filter((item) => item.mobile).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={classes.bottomItem}
              data-active={current?.to === item.to || undefined}
            >
              <item.icon size={22} />
              {item.label}
            </Link>
          ))}
        </nav>
      </AppShell.Footer>

      <SessionTimeoutModal />
    </AppShell>
  );
}
