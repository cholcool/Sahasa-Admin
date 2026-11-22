import {
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NewCustomerModal } from '@/features/orders/components/CustomerModals';

/** 08-03 Customers across channels (SRS 52) */
export const Route = createFileRoute('/_app/master/customers')({
  component: CustomersPage,
});

const CUSTOMERS = [
  {
    name: 'ร้านเจ๊หมวย',
    phone: '081-234-5678',
    extraPhones: 1,
    channel: 'Line',
    billing: 'NOVAT',
    addresses: 2,
    lastOrder: '13 พ.ย.',
  },
  {
    name: 'บจก. สยามฟู้ด',
    phone: '081-555-0101',
    extraPhones: 0,
    channel: 'Facebook',
    billing: 'VAT',
    addresses: 3,
    lastOrder: '12 พ.ย.',
  },
  {
    name: 'ครัวป้าศรี',
    phone: '081-998-1122',
    extraPhones: 0,
    channel: 'โทร',
    billing: 'VAT',
    addresses: 1,
    lastOrder: '13 พ.ย.',
  },
  {
    name: 'สมชาย ใจดี',
    phone: '08x-xxx-4421',
    extraPhones: 0,
    channel: 'Shopee',
    billing: 'NOVAT',
    addresses: 1,
    lastOrder: '13 พ.ย.',
  },
];

function CustomersPage() {
  const [viewing, setViewing] = useState<string | null>(null);
  const [newOpened, newCustomer] = useDisclosure(false);

  return (
    <Stack>
      <PageHeader
        title="ลูกค้า"
        description="ลูกค้าทุกช่องทาง · 1 คนมีได้หลายเบอร์ หลายที่อยู่ หลายชุดใบกำกับ"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={newCustomer.open}>
            เพิ่มลูกค้า
          </Button>
        }
      />
      <Paper withBorder radius="lg" p="md">
        <Stack>
          <Group grow preventGrowOverflow={false} wrap="wrap">
            <TextInput
              miw={240}
              leftSection={<IconSearch size={16} />}
              placeholder="ค้นหาชื่อ, เบอร์โทร, เลขผู้เสียภาษี"
            />
            <Select placeholder="ทุกช่องทาง" clearable data={['Line', 'Facebook', 'Shopee', 'โทร']} />
            <Select data={['VAT และ NOVAT', 'VAT', 'NOVAT']} defaultValue="VAT และ NOVAT" />
          </Group>
          <DataTable
            withTableBorder
            borderRadius="md"
            idAccessor="name"
            records={CUSTOMERS}
            columns={[
              {
                accessor: 'name',
                title: 'ชื่อลูกค้า',
                render: (r) => (
                  <Text fw={700} size="sm">
                    {r.name}
                  </Text>
                ),
              },
              {
                accessor: 'phone',
                title: 'เบอร์หลัก',
                render: (r) => (
                  <>
                    {r.phone}{' '}
                    {r.extraPhones > 0 && (
                      <Text span size="xs" c="dimmed">
                        +{r.extraPhones}
                      </Text>
                    )}
                  </>
                ),
              },
              { accessor: 'channel', title: 'ช่องทาง' },
              {
                accessor: 'billing',
                title: 'บิล',
                render: (r) => (
                  <StatusBadge color={r.billing === 'VAT' ? 'blue' : 'gray'}>
                    {r.billing}
                  </StatusBadge>
                ),
              },
              { accessor: 'addresses', title: 'ที่อยู่', textAlign: 'right' },
              { accessor: 'lastOrder', title: 'Order ล่าสุด' },
              {
                accessor: 'actions',
                title: '',
                textAlign: 'right',
                render: (r) => (
                  <Button size="compact-xs" variant="default" onClick={() => setViewing(r.name)}>
                    ดู
                  </Button>
                ),
              },
            ]}
          />
        </Stack>
      </Paper>

      <ConfirmModal
        opened={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing}
        confirmLabel="แก้ไขข้อมูล"
        doneMessage="เปิดโหมดแก้ไข"
        size="xl"
      >
        {/* TODO: load the selected customer; mock shows บจก. สยามฟู้ด */}
        <Group gap="xs">
          <StatusBadge color="blue">VAT</StatusBadge>
          <StatusBadge>Facebook</StatusBadge>
          <Text size="xs" c="dimmed">
            ลูกค้าตั้งแต่ ม.ค. 2569 · 38 Order · ฿52,400
          </Text>
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Stack gap="xs">
            <ListBlock title="เบอร์โทร" items={['081-555-0101 · หลัก', '02-111-2222 · ฝ่ายจัดซื้อ']} />
            <ListBlock
              title="ข้อมูลใบกำกับภาษี"
              items={[
                ['บจก. สยามฟู้ด (สำนักงานใหญ่) · 0105561234567', true],
                'บจก. สยามฟู้ด (สาขา 00002) · 0105561234567',
              ]}
            />
          </Stack>
          <ListBlock
            title="ที่อยู่จัดส่ง"
            items={[
              ['12 ถ.เพชรเกษม ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90112', true],
              '88 ถ.นิพัทธ์อุทิศ 3 อ.หาดใหญ่ จ.สงขลา 90110',
              '45 ซ.สุขุมวิท 22 คลองเตย กรุงเทพฯ 10110',
            ]}
          />
        </SimpleGrid>
      </ConfirmModal>
      <NewCustomerModal opened={newOpened} onClose={newCustomer.close} />
    </Stack>
  );
}

/** Items: plain text, or [text, isDefault] */
function ListBlock({ title, items }: { title: string; items: (string | [string, boolean])[] }) {
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Title order={5}>{title}</Title>
        <Button size="compact-xs" variant="subtle" leftSection={<IconPlus size={14} />}>
          เพิ่ม
        </Button>
      </Group>
      {items.map((item) => {
        const [text, isDefault] = Array.isArray(item) ? item : [item, false];
        return (
          <Paper key={text} withBorder p="xs" radius="md">
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm">{text}</Text>
              {isDefault && <StatusBadge color="blue">ค่าเริ่มต้น</StatusBadge>}
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
