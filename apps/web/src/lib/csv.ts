type Cell = string | number | null | undefined;

const BOM = '﻿';

function cell(v: Cell): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build CSV text (with a BOM so Excel opens Thai text correctly) */
export function toCsv(rows: Record<string, Cell>[]): string {
  const first = rows[0];
  if (!first) return BOM;
  const headers = Object.keys(first);
  const lines = [
    headers.map(cell).join(','),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(',')),
  ];
  return `${BOM}${lines.join('\r\n')}`;
}

/** Save text as a file through the browser (used by "ส่งออก Excel" and mock-data export) */
export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
