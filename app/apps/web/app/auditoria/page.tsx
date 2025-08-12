'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Auditoria() {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [table, setTable] = useState('Animal');

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/audit', { params: { companyId, table } }).catch(() => ({ data: [] }));
      setRows(res.data || []);
    };
    if (companyId) load();
  }, [companyId, table]);

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Auditoría</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Tabla (ej: Animal)" value={table} onChange={e=>setTable(e.target.value)} />
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Fecha</th><th>Tabla</th><th>Acción</th><th>Before</th><th>After</th></tr></thead>
      <tbody>{rows.map((r:any)=>(<tr key={r.id}>
        <td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.table}</td><td>{r.action}</td>
        <td><pre>{JSON.stringify(r.before,null,2)}</pre></td>
        <td><pre>{JSON.stringify(r.after,null,2)}</pre></td>
      </tr>))}</tbody>
    </table>
  </div>;
}
