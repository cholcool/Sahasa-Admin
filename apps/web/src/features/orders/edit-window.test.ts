import { describe, expect, it } from 'vitest';
import { dayjs } from '@/lib/dayjs';
import { editDeadline } from './edit-window';

describe('editDeadline', () => {
  it('ปิดแก้ไข 08:00 น. ของวันถัดจากรอบส่ง (เวลาไทย)', () => {
    expect(dayjs(editDeadline('2026-11-13')).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')).toBe(
      '2026-11-14 08:00',
    );
  });
});
