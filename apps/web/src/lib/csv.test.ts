import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('มี BOM และหัวคอลัมน์จาก key ของแถวแรก', () => {
    expect(toCsv([{ a: 1, b: 'x' }])).toBe('﻿a,b\r\n1,x');
  });

  it('ครอบด้วย quote เมื่อมี comma หรือ quote', () => {
    expect(toCsv([{ name: 'ร้าน "เจ๊", หาดใหญ่' }])).toBe('﻿name\r\n"ร้าน ""เจ๊"", หาดใหญ่"');
  });

  it('ไม่มีแถวได้แค่ BOM', () => {
    expect(toCsv([])).toBe('﻿');
  });
});
