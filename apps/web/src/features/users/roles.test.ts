import { describe, expect, it } from 'vitest';
import { buildGrantMatrix, PERMISSIONS, toggleGrant } from './roles';

describe('grant matrix', () => {
  it('Admin มีทุกสิทธิ์', () => {
    expect(buildGrantMatrix().Admin.size).toBe(PERMISSIONS.length);
  });

  it('สลับสิทธิ์ของ Role อื่นได้ และไม่แก้ matrix เดิม', () => {
    const before = buildGrantMatrix();
    const after = toggleGrant(before, 'โรงงาน', 'order.create');
    expect(after.โรงงาน.has('order.create')).toBe(true);
    expect(before.โรงงาน.has('order.create')).toBe(false);
    expect(toggleGrant(after, 'โรงงาน', 'order.create').โรงงาน.has('order.create')).toBe(false);
  });

  it('ถอดสิทธิ์ Admin ไม่ได้', () => {
    const m = buildGrantMatrix();
    expect(toggleGrant(m, 'Admin', 'order.view')).toBe(m);
  });
});
