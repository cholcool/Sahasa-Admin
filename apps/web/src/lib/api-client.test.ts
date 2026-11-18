import { describe, expect, it } from 'vitest';
import { toQueryString } from './api-client';

describe('toQueryString', () => {
  it('ข้ามค่าว่างและ undefined', () => {
    expect(toQueryString({ page: 2, q: '', status: undefined })).toBe('?page=2');
  });

  it('คืน string ว่างเมื่อไม่มีค่า', () => {
    expect(toQueryString({})).toBe('');
  });
});
