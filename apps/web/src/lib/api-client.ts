/** เรียก NestJS ที่ /api (domain เดียวกัน cookie session ถูกส่งไปเอง) */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`API ${status}`);
    this.status = status;
    this.body = body;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(`/api${path}`, { credentials: 'include', ...init, headers });
  const body: unknown = res.headers.get('content-type')?.includes('json')
    ? await res.json()
    : await res.text();
  if (!res.ok) throw new ApiError(res.status, body);
  // TODO: ตรวจ response ด้วย zod schema จาก packages/shared เมื่อมี type จริง
  return body as T;
}

/** แปลง object เป็น query string โดยข้ามค่าที่ว่าง */
type QueryValue = string | number | boolean | null | undefined;

export function toQueryString(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
