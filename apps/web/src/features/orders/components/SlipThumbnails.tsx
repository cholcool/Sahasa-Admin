import { Center, Group, Paper, UnstyledButton } from '@mantine/core';
import { IconPhoto, IconPlus } from '@tabler/icons-react';

/** Placeholder thumbnails for payment slips + an "add" tile */
export function SlipThumbnails({ count, onAdd }: { count: number; onAdd?: () => void }) {
  return (
    <Group gap="xs">
      {Array.from({ length: count }, (_, i) => (
        <Paper key={i} withBorder w={64} h={64} radius="md">
          <Center h="100%">
            <IconPhoto size={24} opacity={0.5} />
          </Center>
        </Paper>
      ))}
      <UnstyledButton onClick={onAdd} aria-label="แนบสลิปเพิ่ม">
        <Paper withBorder w={64} h={64} radius="md" style={{ borderStyle: 'dashed' }}>
          <Center h="100%">
            <IconPlus size={20} />
          </Center>
        </Paper>
      </UnstyledButton>
    </Group>
  );
}
