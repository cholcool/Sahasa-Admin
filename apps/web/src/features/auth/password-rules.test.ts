import { describe, expect, it } from 'vitest';
import { isStrongPassword, PASSWORD_RULES } from './password-rules';

describe('password rules', () => {
  it('ผ่านเมื่อครบทุกเงื่อนไข', () => {
    expect(isStrongPassword('Abcdefg1')).toBe(true);
  });

  it('ไม่ผ่านเมื่อไม่มีตัวพิมพ์ใหญ่', () => {
    expect(isStrongPassword('abcdefgh12')).toBe(false);
    expect(PASSWORD_RULES.map((r) => r.test('abcdefgh12'))).toEqual([true, true, false]);
  });

  it('ไม่ผ่านเมื่อสั้นกว่า 8 ตัว', () => {
    expect(isStrongPassword('Ab1')).toBe(false);
  });
});
