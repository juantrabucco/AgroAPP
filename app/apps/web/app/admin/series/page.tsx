'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function Series() {
  const { companyId } = useAuth();
  const [form, setForm] = useState({ type: 'SALE', prefix: 'V-', nextNumber: 1 });
  const { data: rows=[], refetch } = useQuery({ queryKey:['seq', companyId], queryFn: async()=> (await api.get('/sequences', { params: { companyId } })).data, enabled: !!companyId });

  const crear = async () => { await api.post('/sequences', { ...form, companyId }); setForm({ type:'SALE', prefix:'V-', nextNumber: 1 }); refetch(); };
  const actualizar = async (id: string, nextNumber: number) => { await api.patch(`/sequences/${id}`, { nextNumber }); refetch(); };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Series y Numeración</h1>
    <div style={{ display:'flex', gap:8 }}>
      <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
        <option value="SALE">SALE</option>
        <option value="PURCHASE">PURCHASE</option>
      </select>
      <input placeholder="Prefijo" value={form.prefix} onChange={e=>setForm({...form, prefix:e.target.value})} />
      <input type="number" value={form.nextNumber} onChange={e=>setForm({...form, nextNumber:Number(e.target.value)})} />
      <button onClick={crear}>Crear serie</button>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Tipo</th><th>Prefijo</th><th>Próximo</th><th>Acción</th></tr></thead>
      <tbody>
        {(rows as any[]).map((s:any)=>(
          <tr key={s.id}>
            <td>{s.type}</td>
            <td>{s.prefix||''}</td>
            <td><input type="number" defaultValue={s.nextNumber} onBlur={e=>actualizar(s.id, Number(e.target.value))} /></td>
            <td></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
}
