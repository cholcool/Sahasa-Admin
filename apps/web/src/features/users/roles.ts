// Draft roles and permissions from UI Prototype/pages/10-02 (pending: item 61, Q22, Q41)

export const ROLES = ['Admin', 'Owner', 'หัวหน้า', 'Sales', 'โรงงาน', 'บัญชี'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_COLOR: Record<Role, string> = {
  Admin: 'brand',
  Owner: 'gold',
  หัวหน้า: 'orange',
  Sales: 'blue',
  โรงงาน: 'gray',
  บัญชี: 'green',
};

export interface Permission {
  code: string;
  label: string;
  group: string;
}

export const PERMISSIONS: Permission[] = [
  { group: 'Order', code: 'order.view', label: 'ดู Order' },
  { group: 'Order', code: 'order.create', label: 'สร้าง Order' },
  { group: 'Order', code: 'order.edit', label: 'แก้ไข Order' },
  { group: 'Order', code: 'order.confirm', label: 'ยืนยัน Order' },
  { group: 'Order', code: 'order.cancel', label: 'ยกเลิก Order' },
  { group: 'Order', code: 'order.after_cutoff', label: 'เพิ่ม Order หลังตัดรอบ' },
  { group: 'Order', code: 'payment.confirm', label: 'ยืนยันรับเงิน' },
  { group: 'Order', code: 'order.amount', label: 'เห็นยอดเงิน' },
  { group: 'โรงงาน', code: 'factory.accept', label: 'รับ Order / พิมพ์เอกสาร' },
  { group: 'โรงงาน', code: 'factory.ship', label: 'บันทึกการจัดส่ง' },
  { group: 'บัญชี', code: 'acc.document', label: 'ออกเอกสาร / ใบลดหนี้' },
  { group: 'บัญชี', code: 'acc.recon', label: 'กระทบยอด' },
  { group: 'ระบบ', code: 'master.manage', label: 'ข้อมูลหลัก' },
  { group: 'ระบบ', code: 'user.manage', label: 'ผู้ใช้และสิทธิ์' },
  { group: 'ระบบ', code: 'platform.manage', label: 'เชื่อมต่อ Platform' },
];

/** Default grants per role (Admin is implicit: always everything) */
export const DEFAULT_GRANTS: Record<Exclude<Role, 'Admin'>, string[]> = {
  Owner: [
    'order.view',
    'order.create',
    'order.edit',
    'order.confirm',
    'order.cancel',
    'order.after_cutoff',
    'payment.confirm',
    'order.amount',
    'factory.accept',
    'factory.ship',
    'acc.document',
    'acc.recon',
  ],
  หัวหน้า: [
    'order.view',
    'order.create',
    'order.edit',
    'order.confirm',
    'order.cancel',
    'order.after_cutoff',
    'order.amount',
  ],
  Sales: [
    'order.view',
    'order.create',
    'order.edit',
    'order.confirm',
    'payment.confirm',
    'order.amount',
  ],
  โรงงาน: ['order.view', 'factory.accept', 'factory.ship'],
  บัญชี: ['order.view', 'payment.confirm', 'order.amount', 'acc.document', 'acc.recon'],
};

export type GrantMatrix = Record<Role, Set<string>>;

export function buildGrantMatrix(): GrantMatrix {
  return {
    Admin: new Set(PERMISSIONS.map((p) => p.code)),
    Owner: new Set(DEFAULT_GRANTS.Owner),
    หัวหน้า: new Set(DEFAULT_GRANTS.หัวหน้า),
    Sales: new Set(DEFAULT_GRANTS.Sales),
    โรงงาน: new Set(DEFAULT_GRANTS.โรงงาน),
    บัญชี: new Set(DEFAULT_GRANTS.บัญชี),
  };
}

/** Toggle a permission; Admin always keeps every permission */
export function toggleGrant(matrix: GrantMatrix, role: Role, code: string): GrantMatrix {
  if (role === 'Admin') return matrix;
  const next = new Set(matrix[role]);
  if (next.has(code)) next.delete(code);
  else next.add(code);
  return { ...matrix, [role]: next };
}
