'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

export default function Lotes() {
  const sp = useSearchParams();
  const fieldId = sp.get('fieldId') || '';
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const load = async () => { if(!fieldId) return; const res = await api.get('/lots', { params: { fieldId } }); setRows(res.data); };
  useEffect(()=>{ load(); }, [fieldId]);
  const crear = async () => { await api.post('/lots', { fieldId, name }); setName(''); load(); };
  const renombrar = async (id: string, name: string) => { await api.patch(`/lots/${id}`, { name }); load(); };
  const borrar = async (id: string) => { await api.delete(`/lots/${id}`); load(); };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Lotes del campo</h1>
    <div>ID Campo: {fieldId||'(selecciona desde /campos)'} </div>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Nombre de lote" value={name} onChange={e=>setName(e.target.value)} />
      <button onClick={crear} disabled={!name || !fieldId}>Crear</button>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Nombre</th><th>Animales</th><th>Acciones</th></tr></thead>
      <tbody>
        {rows.map((l:any)=>(<tr key={l.id}>
          <td>{l.name}</td>
          <td>{l._count?.animals ?? '-'}</td>
          <td>
            <button onClick={()=>{ const n=prompt('Nuevo nombre', l.name)||l.name; renombrar(l.id,n); }}>Renombrar</button>
            <button onClick={()=>borrar(l.id)}>Borrar</button>
          </td>
        </tr>))}
      </tbody>
    </table>
  </div>;
}
