import { dayjs } from '@/lib/dayjs';

/** Editing closes 20 hours after the round's 12:00 cut-off (pending Q9) */
export function editDeadline(roundDate: string): string {
  return dayjs.tz(`${roundDate} 12:00`, 'Asia/Bangkok').add(20, 'hour').format();
}
