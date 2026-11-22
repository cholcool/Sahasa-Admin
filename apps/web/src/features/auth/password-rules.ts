export interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

/** Password policy shown on the reset page (SRS 2) */
export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'อย่างน้อย 8 ตัวอักษร', test: (p) => p.length >= 8 },
  { label: 'มีตัวเลขอย่างน้อย 1 ตัว', test: (p) => /\d/.test(p) },
  { label: 'มีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว', test: (p) => /[A-Z]/.test(p) },
];

export function isStrongPassword(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}
