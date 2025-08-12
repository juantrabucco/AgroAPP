'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function Potreros() {
  const [fieldId, setFieldId] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const load = async () => { if(!fieldId) return; const res = await api.get('/paddocks', { params: { fieldId } }); setRows(res.data); };
  useEffect(() => { load(); }, [fieldId]);

  const crear = async () => { await api.post('/paddocks', { fieldId, name }); setName(''); await load(); };
  const renombrar = async (id: string, name: string) => { await api.patch(`/paddocks/${id}`, { name }); await load(); };
  const borrar = async (id: string) => { await api.delete(`/paddocks/${id}`); await load(); };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Potreros</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Field ID" value={fieldId} onChange={e=>setFieldId(e.target.value)} />
      <button onClick={load}>Cargar</button>
    </div>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Nombre de potrero" value={name} onChange={e=>setName(e.target.value)} />
      <button onClick={crear} disabled={!name || !fieldId}>Crear</button>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Nombre</th><th>Acciones</th></tr></thead>
      <tbody>
        {rows.map((p:any)=> <tr key={p.id}>
          <td>{p.name}</td>
          <td>
            <button onClick={()=>{ const n=prompt('Nuevo nombre', p.name)||p.name; renombrar(p.id,n); }}>Renombrar</button>
            <button onClick={()=>borrar(p.id)}>Borrar</button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}
