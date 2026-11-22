import { Group, SegmentedControl, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

const VIEWS = [
  { label: 'Sales/Admin', value: '/' },
  { label: 'โรงงาน', value: '/dashboard/factory' },
  { label: 'บัญชี', value: '/dashboard/accounting' },
] as const;

type ViewPath = (typeof VIEWS)[number]['value'];

/**
 * Demo switch between role dashboards (prototype "มุมมองตาม Role")
 * TODO: pick the dashboard from the logged-in user's role and remove this switch
 */
export function RoleViewSwitch({ value }: { value: ViewPath }) {
  const navigate = useNavigate();
  return (
    <Group gap="sm">
      <Text size="sm" c="dimmed">
        มุมมองตาม Role (ตัวอย่าง)
      </Text>
      <SegmentedControl
        radius="xl"
        size="xs"
        value={value}
        data={[...VIEWS]}
        onChange={(to) => void navigate({ to })}
      />
    </Group>
  );
}
