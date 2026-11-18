import { createFileRoute } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';

/** layout ของทุกหน้าหลัง login (ชื่อขึ้นต้นด้วย _ จึงไม่เพิ่ม path ใน URL) */
export const Route = createFileRoute('/_app')({
  // TODO: beforeLoad ตรวจ session จาก Better Auth ถ้าไม่มีให้ redirect ไป /login
  component: AppLayout,
});
