'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Items() {
  const { companyId } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', type: 'INSUMO', unit: 'UN' });

  const load = async () => {
    const res = await api.get('/items', { params: { companyId } });
    setItems(res.data);
  };
  useEffect(() => { if (companyId) load(); }, [companyId]);

  const crear = async () => { await api.post('/items', { ...form, companyId }); setForm({ name:'', type:'INSUMO', unit:'UN' }); await load(); };

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Items</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <input placeholder="Tipo" value={form.type} onChange={e=>setForm({...form, type:e.target.value})} />
      <input placeholder="Unidad" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} />
      <button onClick={crear}>Crear</button>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Nombre</th><th>Tipo</th><th>Unidad</th></tr></thead>
      <tbody>{items.map((i:any)=><tr key={i.id}><td>{i.name}</td><td>{i.type}</td><td>{i.unit||''}</td></tr>)}</tbody>
    </table>
  </div>;
}
