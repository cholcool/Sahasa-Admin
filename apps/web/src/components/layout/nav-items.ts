import {
  IconBuildingFactory2,
  IconCash,
  IconChartBar,
  IconDatabase,
  IconLayoutDashboard,
  IconPackages,
  IconPlugConnected,
  IconReceipt,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';

export interface NavChild {
  label: string;
  to: string;
}

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** Show in the mobile bottom nav (max 5 items) */
  mobile?: boolean;
  /** Module not yet confirmed by the client (shown with a "ร่าง" badge) */
  draft?: boolean;
  children?: NavChild[];
}

// Menu follows UI Prototype/pages/00_menu-map.html
// TODO: filter by permission (role_menus) once RBAC is built
export const NAV_ITEMS: NavItem[] = [
  { label: 'แดชบอร์ด', to: '/', icon: IconLayoutDashboard, mobile: true },
  {
    label: 'ออเดอร์',
    to: '/orders',
    icon: IconReceipt,
    mobile: true,
    children: [
      { label: 'รายการ Order', to: '/orders' },
      { label: 'สร้าง Order', to: '/orders/new' },
      { label: 'อัปโหลด Excel', to: '/orders/upload' },
    ],
  },
  {
    label: 'โรงงาน',
    to: '/factory',
    icon: IconBuildingFactory2,
    mobile: true,
    children: [
      { label: 'คิว Order', to: '/factory' },
      { label: 'สรุปยอดผลิต', to: '/factory/production' },
      { label: 'พิมพ์เอกสาร', to: '/factory/print' },
      { label: 'การจัดส่ง', to: '/factory/shipping' },
    ],
  },
  {
    label: 'บัญชี',
    to: '/accounting',
    icon: IconCash,
    mobile: true,
    children: [
      { label: 'รับรู้รายได้', to: '/accounting' },
      { label: 'เอกสารบัญชี', to: '/accounting/documents' },
      { label: 'ใบลดหนี้', to: '/accounting/credit-notes' },
      { label: 'กระทบยอด Marketplace', to: '/accounting/reconcile' },
    ],
  },
  {
    label: 'รายงาน',
    to: '/reports',
    icon: IconChartBar,
    children: [
      { label: 'ยอดขาย', to: '/reports' },
      { label: 'Order ค้าง', to: '/reports/pending' },
      { label: 'สถิติแก้ไข/ยกเลิก', to: '/reports/edits' },
      { label: 'ภาษีขาย', to: '/reports/tax' },
      { label: 'กระทบยอด', to: '/reports/reconcile' },
    ],
  },
  {
    label: 'เชื่อมต่อ Platform',
    to: '/platforms',
    icon: IconPlugConnected,
    children: [
      { label: 'การเชื่อมต่อ', to: '/platforms' },
      { label: 'Log การเชื่อมต่อ', to: '/platforms/logs' },
      { label: 'SKU ที่จับคู่ไม่ได้', to: '/platforms/unmapped-sku' },
    ],
  },
  {
    label: 'ข้อมูลหลัก',
    to: '/master',
    icon: IconDatabase,
    children: [
      { label: 'สินค้า', to: '/master' },
      { label: 'จับคู่ SKU', to: '/master/sku-mapping' },
      { label: 'ลูกค้า', to: '/master/customers' },
      { label: 'ช่องทางการขาย', to: '/master/channels' },
      { label: 'ขนส่ง', to: '/master/carriers' },
      { label: 'เหตุผลยกเลิก', to: '/master/cancel-reasons' },
      { label: 'เวลาตัดรอบ', to: '/master/cutoff' },
      { label: 'ข้อมูลบริษัท', to: '/master/company' },
      { label: 'นำเข้าข้อมูลเก่า', to: '/master/import' },
    ],
  },
  {
    label: 'สต็อก',
    to: '/stock',
    icon: IconPackages,
    draft: true,
    children: [
      { label: 'สต็อกคงเหลือ', to: '/stock' },
      { label: 'รับเข้า / ปรับยอด', to: '/stock/receive' },
      { label: 'ประวัติการเคลื่อนไหว', to: '/stock/ledger' },
    ],
  },
  {
    label: 'ผู้ใช้และสิทธิ์',
    to: '/users',
    icon: IconUsers,
    mobile: true,
    children: [
      { label: 'ผู้ใช้', to: '/users' },
      { label: 'Role และสิทธิ์', to: '/users/roles' },
      { label: 'Audit log', to: '/users/audit' },
      { label: 'ศูนย์แจ้งเตือน', to: '/users/notifications' },
    ],
  },
];

/** Find the section and sub-menu that match a pathname (used for breadcrumb and mobile tabs) */
export function findNavMatch(pathname: string): { item?: NavItem; child?: NavChild } {
  const path = pathname.replace(/\/+$/, '') || '/';
  const item =
    path === '/' || path.startsWith('/dashboard')
      ? NAV_ITEMS[0]
      : NAV_ITEMS.find((i) => i.to !== '/' && (path === i.to || path.startsWith(`${i.to}/`)));
  if (!item?.children) return { item };
  // Longest matching child wins, so /orders/new beats /orders
  const child = item.children
    .toSorted((a, b) => b.to.length - a.to.length)
    .find((c) => path === c.to || path.startsWith(`${c.to}/`));
  return { item, child };
}
