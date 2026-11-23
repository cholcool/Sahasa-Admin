import { Alert, Checkbox, NumberInput, Paper, Radio, Stack, Text } from '@mantine/core';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KeyValue } from '@/components/ui/KeyValue';
import { useMockDb } from '@/features/mock/store';

export interface UnmappedSku {
  id?: string;
  platform: string;
  sku: string;
  name: string;
  orders: number;
}

/** Modal · จับคู่ SKU (unmapped SKUs + master SKU mapping) */
export function SkuMatchModal({
  sku,
  onClose,
  onConfirm,
}: {
  sku: UnmappedSku | null;
  onClose: () => void;
  onConfirm?: (sku: UnmappedSku) => void;
}) {
  const db = useMockDb();
  return (
    <ConfirmModal
      opened={sku !== null}
      onClose={onClose}
      title="จับคู่ SKU"
      confirmLabel="บันทึกการจับคู่"
      doneMessage={sku?.orders ? `จับคู่ SKU แล้ว · ปลด flag ${sku.orders} Order` : 'บันทึกการจับคู่แล้ว'}
      onConfirm={() => sku && onConfirm?.(sku)}
    >
      {sku && (
        <>
          <Paper withBorder p="sm" radius="md">
            <Stack gap={4}>
              <KeyValue label="Platform">{sku.platform}</KeyValue>
              <KeyValue label="SKU">
                <Text span ff="monospace" size="sm">
                  {sku.sku}
                </Text>
              </KeyValue>
              <KeyValue label="ชื่อใน Platform">{sku.name}</KeyValue>
            </Stack>
          </Paper>
          <Radio.Group label="สินค้าในระบบ" defaultValue={db.products[0]?.id}>
            <Stack gap="xs" mt="xs">
              {db.products.map((p) => (
                <Radio key={p.id} value={p.id} label={`${p.id} ${p.name}`} />
              ))}
            </Stack>
          </Radio.Group>
          <NumberInput
            label="จำนวนต่อ 1 SKU"
            defaultValue={2}
            min={1}
            rightSection={<Text size="xs">แพ็ค</Text>}
            rightSectionWidth={48}
            description="เช่น โปรแพ็คคู่ 1 SKU = 2 แพ็ค"
          />
          <Checkbox defaultChecked label="บันทึกเป็นกฎจับคู่ถาวร (ข้อมูลหลัก › จับคู่ SKU)" />
          {sku.orders > 0 && (
            <Alert color="green" variant="light">
              Order ที่ติด flag {sku.orders} รายการจะเข้าคิวโรงงานหลังบันทึก
            </Alert>
          )}
        </>
      )}
    </ConfirmModal>
  );
}
