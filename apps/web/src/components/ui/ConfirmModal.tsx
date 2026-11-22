import { Button, Group, Modal, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { notifyDone } from '@/lib/notify';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  confirmLabel: string;
  /** Toast shown after confirming */
  doneMessage?: string;
  onConfirm?: () => void;
  confirmColor?: string;
  confirmDisabled?: boolean;
  size?: string | number;
}

/** Standard modal with Cancel / Confirm footer used across prototype pages */
export function ConfirmModal({
  opened,
  onClose,
  title,
  children,
  confirmLabel,
  doneMessage,
  onConfirm,
  confirmColor,
  confirmDisabled,
  size = 'lg',
}: ConfirmModalProps) {
  const confirm = () => {
    onConfirm?.();
    if (doneMessage) notifyDone(doneMessage);
    onClose();
  };
  return (
    <Modal opened={opened} onClose={onClose} title={title} size={size} centered>
      <Stack>{children}</Stack>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button color={confirmColor} onClick={confirm} disabled={confirmDisabled}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
