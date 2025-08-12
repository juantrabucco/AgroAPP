'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function Periodos() {
  const { companyId } = useAuth();
  const [form, setForm] = useState({ fromDate: '', toDate: '' });
  const { data: rows=[], refetch } = useQuery({ queryKey:['periods', companyId], queryFn: async()=> (await api.get('/accounting/periods', { params: { companyId } })).data, enabled: !!companyId });

  const crear = async () => { await api.post('/accounting/periods', { ...form, companyId }); setForm({ fromDate:'', toDate:'' }); refetch(); };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Cierres de período</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input type="date" value={form.fromDate} onChange={e=>setForm({...form, fromDate:e.target.value})} />
      <input type="date" value={form.toDate} onChange={e=>setForm({...form, toDate:e.target.value})} />
      <button onClick={crear} disabled={!form.fromDate || !form.toDate}>Cerrar periodo</button>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Desde</th><th>Hasta</th><th>Creado</th></tr></thead>
      <tbody>
        {(rows as any[]).map((p:any)=>(
          <tr key={p.id}>
            <td>{new Date(p.fromDate).toLocaleDateString()}</td>
            <td>{new Date(p.toDate).toLocaleDateString()}</td>
            <td>{new Date(p.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
}
