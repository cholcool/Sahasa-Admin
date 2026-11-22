import { describe, expect, it } from 'vitest';
import { formatCountdown } from './session-timeout';

describe('formatCountdown', () => {
  it('แสดงนาทีและวินาทีสองหลัก', () => {
    expect(formatCountdown(59)).toBe('00:59');
    expect(formatCountdown(125)).toBe('02:05');
  });

  it('ค่าติดลบแสดงเป็นศูนย์', () => {
    expect(formatCountdown(-3)).toBe('00:00');
  });
});
