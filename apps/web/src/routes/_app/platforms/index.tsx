import {
  Button,
  Group,
  PasswordInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AddCard } from '@/components/ui/AddCard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import {
  ConnectionCard,
  type ConnectionInfo,
} from '@/features/platforms/components/ConnectionCard';
import { notifyDone } from '@/lib/notify';

/** 07-01 Platform and carrier API connections (SRS 40, 41, 45, 49) */
export const Route = createFileRoute('/_app/platforms/')({
  component: ConnectionsPage,
});

interface Connection extends ConnectionInfo {
  primary?: string;
  canPull?: boolean;
}

const MARKETPLACES: Connection[] = [
  {
    name: 'Shopee',
    subtitle: 'ร้าน khlongngaetofu',
    status: { label: 'เชื่อมต่อแล้ว', color: 'green' },
    details: [
      ['ดึงข้อมูลล่าสุด', '10:45 น.'],
      ['วิธีดึง Order', 'Webhook + Pull ทุก 10 นาที'],
      ['ส่งสถานะกลับ', 'เปิด'],
    ],
    canPull: true,
  },
  {
    name: 'Lazada',
    subtitle: 'ร้าน Sahasa Official',
    status: { label: 'ผิดพลาด', color: 'brand' },
    details: [
      ['ปัญหา', 'Access token หมดอายุ'],
      ['ล้มเหลวล่าสุด', '10:45 น.'],
      ['Order ที่รอดึง', '~6 รายการ'],
    ],
    primary: 'เชื่อมต่อใหม่',
  },
  {
    name: 'TikTok Shop',
    subtitle: 'ยังไม่มีข้อมูลร้าน',
    status: { label: 'ยังไม่เชื่อมต่อ', color: 'gray' },
    details: [
      ['สถานะ', 'ระบบรองรับไว้แล้ว (Q33)'],
      ['Order ที่ดึงได้', '—'],
    ],
  },
];

const CARRIERS: Connection[] = [
  {
    name: 'Inter Express',
    subtitle: 'หาดใหญ่',
    status: { label: 'เชื่อมต่อแล้ว', color: 'green' },
    details: [
      ['อัปเดตสถานะล่าสุด', '10:30 น.'],
      ['คีย์เลข Tracking เอง', 'ได้'],
    ],
  },
  {
    name: 'Nim Express',
    subtitle: 'กรุงเทพฯ',
    status: { label: 'เชื่อมต่อแล้ว', color: 'green' },
    details: [
      ['อัปเดตสถานะล่าสุด', '10:28 น.'],
      ['คีย์เลข Tracking เอง', 'ได้'],
    ],
  },
  {
    name: 'Fuze Express',
    subtitle: 'กรุงเทพฯ',
    status: { label: 'รอตั้งค่า', color: 'orange' },
    details: [
      ['สถานะ', 'ยังไม่ใส่ API key'],
      ['คีย์เลข Tracking เอง', 'ได้'],
    ],
    primary: 'ตั้งค่า',
  },
];

function ConnectionsPage() {
  const [editing, setEditing] = useState<string | null>(null);

  const cardActions = (c: Connection) => (
    <>
      {c.primary ? (
        <Button size="xs" onClick={() => setEditing(c.name)}>
          {c.primary}
        </Button>
      ) : (
        <Button size="xs" variant="default" onClick={() => setEditing(c.name)}>
          {c.status.color === 'gray' ? 'เชื่อมต่อ' : 'ตั้งค่า'}
        </Button>
      )}
      {c.canPull && (
        <Button size="xs" variant="subtle" onClick={() => notifyDone(`กำลังดึง Order จาก ${c.name}`)}>
          ดึงตอนนี้
        </Button>
      )}
    </>
  );

  return (
    <Stack>
      <PageHeader title="การเชื่อมต่อ" description="ตั้งค่า API ของ Marketplace และขนส่ง" />
      <SectionCard title="Marketplace">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {MARKETPLACES.map((c) => (
            <ConnectionCard key={c.name} info={c} actions={cardActions(c)} />
          ))}
          <AddCard
            label="เพิ่มร้าน / Platform"
            hint="รองรับหลายร้านต่อ Platform (Q34)"
            onClick={() => setEditing('Shopee')}
          />
        </SimpleGrid>
      </SectionCard>
      <SectionCard title="API ขนส่ง">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {CARRIERS.map((c) => (
            <ConnectionCard key={c.name} info={c} actions={cardActions(c)} />
          ))}
        </SimpleGrid>
      </SectionCard>
      <ApiSettingsModal platform={editing} onClose={() => setEditing(null)} />
    </Stack>
  );
}

function ApiSettingsModal({ platform, onClose }: { platform: string | null; onClose: () => void }) {
  const [mode, setMode] = useState('ทั้งสองแบบ');
  return (
    <ConfirmModal
      opened={platform !== null}
      onClose={onClose}
      title={`ตั้งค่า API · ${platform ?? ''}`}
      confirmLabel="บันทึก"
      doneMessage={`บันทึกการตั้งค่า ${platform ?? ''} แล้ว`}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Select
          label="Platform"
          data={['Shopee', 'Lazada', 'TikTok Shop', 'Inter Express', 'Nim Express', 'Fuze Express']}
          defaultValue={platform}
        />
        <TextInput label="ชื่อร้าน" defaultValue="khlongngaetofu" />
        <TextInput label="Shop ID" defaultValue="229381145" />
        <TextInput label="Partner ID" defaultValue="2004512" />
        {/* Secrets are typed by the user; the API must store them encrypted */}
        <PasswordInput
          label="Partner Key"
          placeholder="วาง Partner Key"
          style={{ gridColumn: '1 / -1' }}
        />
      </SimpleGrid>
      <div>
        <Text size="sm" fw={500} mb={4}>
          วิธีดึง Order (รอยืนยัน Q37)
        </Text>
        <SegmentedControl
          data={['Webhook', 'ตั้งเวลา Pull', 'ทั้งสองแบบ']}
          value={mode}
          onChange={setMode}
        />
      </div>
      <Group grow align="flex-end">
        <Select
          label="ความถี่ Pull"
          data={['ทุก 5 นาที', 'ทุก 10 นาที', 'ทุก 15 นาที']}
          defaultValue="ทุก 10 นาที"
        />
        <Switch label="ส่งเลข Tracking และสถานะกลับ" defaultChecked mb={8} />
      </Group>
      <Button
        variant="default"
        w="fit-content"
        onClick={() => notifyDone('เชื่อมต่อสำเร็จ · พบ Order ใหม่ 2 รายการ')}
      >
        ทดสอบการเชื่อมต่อ
      </Button>
    </ConfirmModal>
  );
}
