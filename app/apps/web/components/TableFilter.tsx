'use client';
import { useMemo, useState } from 'react';

export function useTableFilter<T>(rows: T[], keys: (keyof T)[]) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r:any)=>
      keys.some(k => String(r[k] ?? '').toLowerCase().includes(needle))
    );
  }, [rows, q, keys]);
  return { q, setQ, filtered };
}
