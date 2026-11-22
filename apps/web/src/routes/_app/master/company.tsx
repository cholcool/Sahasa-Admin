import {
  Button,
  FileInput,
  Grid,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrintPaper } from '@/components/ui/PrintPaper';
import { SectionCard } from '@/components/ui/SectionCard';
import { notifyDone } from '@/lib/notify';

/** 08-08 Company details for invoice headers (SRS 57) */
export const Route = createFileRoute('/_app/master/company')({
  component: CompanyPage,
});

function CompanyPage() {
  const [company, setCompany] = useState({
    name: 'บริษัท สหัสา ฟู้ด จำกัด',
    taxId: '0905561000123',
    branch: 'สำนักงานใหญ่',
    phone: '074-123-456',
    address: '99 ถ.คลองแงะ ต.พังลา อ.สะเดา จ.สงขลา 90170',
  });
  const set = (key: keyof typeof company) => (value: string) =>
    setCompany((c) => ({ ...c, [key]: value }));

  return (
    <Stack>
      <PageHeader
        title="ข้อมูลบริษัท"
        description="ใช้เป็นหัวเอกสารบิลและใบกำกับภาษี"
        actions={<Button onClick={() => notifyDone('บันทึกข้อมูลบริษัทแล้ว')}>บันทึก</Button>}
      />
      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <SectionCard title="ข้อมูลผู้ขาย">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="ชื่อบริษัท"
                withAsterisk
                value={company.name}
                onChange={(e) => set('name')(e.currentTarget.value)}
              />
              <TextInput
                label="เลขประจำตัวผู้เสียภาษี"
                withAsterisk
                value={company.taxId}
                onChange={(e) => set('taxId')(e.currentTarget.value)}
              />
              <Select
                label="สาขา"
                data={['สำนักงานใหญ่', 'สาขา 00001']}
                value={company.branch}
                onChange={(v) => set('branch')(v ?? 'สำนักงานใหญ่')}
              />
              <TextInput
                label="โทรศัพท์"
                value={company.phone}
                onChange={(e) => set('phone')(e.currentTarget.value)}
              />
              <Textarea
                label="ที่อยู่"
                value={company.address}
                onChange={(e) => set('address')(e.currentTarget.value)}
                style={{ gridColumn: '1 / -1' }}
              />
              <FileInput
                label="โลโก้"
                description="PNG หรือ SVG ขาวดำ เหมาะกับเครื่องพิมพ์ dot matrix"
                placeholder="เลือกไฟล์"
                accept="image/png,image/svg+xml"
                leftSection={<IconUpload size={16} />}
                style={{ gridColumn: '1 / -1' }}
              />
              <TextInput
                label="ข้อความท้ายเอกสาร"
                defaultValue="ขอบคุณที่อุดหนุน · สินค้าแช่เย็น 0–4°C"
                style={{ gridColumn: '1 / -1' }}
              />
            </SimpleGrid>
          </SectionCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <SectionCard title="ตัวอย่างหัวเอกสาร">
            <PrintPaper>
              <Group justify="space-between" mb="xs">
                <Text fw={700} fz="lg">
                  สหัสา
                </Text>
                <Text size="sm">ใบกำกับภาษี/ใบเสร็จรับเงิน</Text>
              </Group>
              <Text size="xs">
                {company.name} ({company.branch})
                <br />
                {company.address}
                <br />
                เลขผู้เสียภาษี {company.taxId} · โทร {company.phone}
              </Text>
            </PrintPaper>
          </SectionCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
