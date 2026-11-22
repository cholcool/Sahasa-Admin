import { Select, Switch, TextInput } from '@mantine/core';
import type { ReactNode } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface SimpleItemModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  /** Value shown when editing an existing row */
  name?: string;
  namePlaceholder?: string;
  /** Options for the "ประเภท" select; omit to hide it */
  types?: string[];
  type?: string;
  children?: ReactNode;
  doneMessage?: string;
}

/** Modal · เพิ่ม/แก้ไขรายการ for small master lists (channels, carriers, reasons) */
export function SimpleItemModal({
  opened,
  onClose,
  title = 'เพิ่ม / แก้ไขรายการ',
  name,
  namePlaceholder,
  types,
  type,
  children,
  doneMessage = 'บันทึกแล้ว',
}: SimpleItemModalProps) {
  return (
    <ConfirmModal
      opened={opened}
      onClose={onClose}
      title={title}
      confirmLabel="บันทึก"
      doneMessage={doneMessage}
      size="md"
    >
      {/* key resets the uncontrolled inputs when another row is opened */}
      <TextInput
        key={name}
        label="ชื่อ"
        withAsterisk
        defaultValue={name}
        placeholder={namePlaceholder}
      />
      {types && <Select key={type} label="ประเภท" data={types} defaultValue={type ?? types[0]} />}
      {children}
      <Switch label="ใช้งาน" defaultChecked />
    </ConfirmModal>
  );
}
