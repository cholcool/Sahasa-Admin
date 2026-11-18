import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(buddhistEra);
dayjs.locale('th');
dayjs.tz.setDefault('Asia/Bangkok');

/** แสดงวันที่แบบไทย ปี พ.ศ. เช่น 18 พ.ย. 2569 (DB เก็บ UTC) */
export function formatThaiDate(value: string | Date, pattern = 'D MMM BBBB'): string {
  return dayjs(value).tz('Asia/Bangkok').format(pattern);
}

export { dayjs };
