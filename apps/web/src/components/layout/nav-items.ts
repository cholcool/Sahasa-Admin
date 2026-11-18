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

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** แสดงใน bottom nav บนมือถือ (สูงสุด 5 รายการ) */
  mobile?: boolean;
}

// เมนูตาม prototype — TODO: กรองตามสิทธิ์ (role_menus) หลังทำ RBAC
export const NAV_ITEMS: NavItem[] = [
  { label: 'แดชบอร์ด', to: '/', icon: IconLayoutDashboard, mobile: true },
  { label: 'ออเดอร์', to: '/orders', icon: IconReceipt, mobile: true },
  { label: 'โรงงาน', to: '/factory', icon: IconBuildingFactory2, mobile: true },
  { label: 'บัญชี', to: '/accounting', icon: IconCash, mobile: true },
  { label: 'รายงาน', to: '/reports', icon: IconChartBar },
  { label: 'เชื่อมต่อ Platform', to: '/platforms', icon: IconPlugConnected },
  { label: 'ข้อมูลหลัก', to: '/master', icon: IconDatabase },
  { label: 'สต็อก', to: '/stock', icon: IconPackages },
  { label: 'ผู้ใช้และสิทธิ์', to: '/users', icon: IconUsers, mobile: true },
];
