'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Buscar() {
  const { companyId } = useAuth();
  const [q, setQ] = useState('');
  const [result, setResult] = useState<any>();

  const go = async () => {
    const r = await api.get('/search', { params: { companyId, q } });
    setResult(r.data);
  };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Búsqueda global</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Caravana, nombre, CUIT..." value={q} onChange={e=>setQ(e.target.value)} />
      <button onClick={go} disabled={!q}>Buscar</button>
    </div>
    {result && <div style={{ display:'grid', gap:12 }}>
      <section><h3>Animales</h3><ul>{(result.animals||[]).map((a:any)=><li key={a.id}><a href={`/animales/${a.id}`}>{a.tagId}</a></li>)}</ul></section>
      <section><h3>Contrapartes</h3><ul>{(result.counterparties||[]).map((c:any)=><li key={c.id}><a href={`/comercial/contrapartes?id=${c.id}`}>{c.name} ({c.taxId||''})</a></li>)}</ul></section>
      <section><h3>Items</h3><ul>{(result.items||[]).map((i:any)=><li key={i.id}>{i.name}</li>)}</ul></section>
    </div>}
  </div>;
}
