'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function Campos() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const load = async () => { const res = await api.get('/fields'); setRows(res.data); };
  useEffect(()=>{ load(); }, []);
  const crear = async () => { await api.post('/fields', { name }); setName(''); load(); };
  return <div style={{ display:'grid', gap:12 }}>
    <h1>Campos</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Nombre de campo" value={name} onChange={e=>setName(e.target.value)} />
      <button onClick={crear} disabled={!name}>Crear</button>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Nombre</th><th>Acciones</th></tr></thead>
      <tbody>
        {rows.map((f:any)=>(<tr key={f.id}><td>{f.name}</td><td><Link href={`/campos/lotes?fieldId=${f.id}`}>Lotes</Link> · <Link href={`/campos/potreros`}>Potreros</Link></td></tr>))}
      </tbody>
    </table>
  </div>;
}
