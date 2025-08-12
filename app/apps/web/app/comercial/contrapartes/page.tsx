'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { parseCSV } from '@/lib/csv';

export default function Contrapartes() {
  const { companyId } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', type: 'CUSTOMER', taxId: '' });
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get('/counterparties', { params: { companyId } });
    setItems(res.data);
  };
  useEffect(() => { if (companyId) load(); }, [companyId]);

  const crear = async () => { await api.post('/counterparties', { ...form, companyId }); setForm({ name:'', type:'CUSTOMER', taxId:'' }); await load(); };
  const onFile = async (e: any) => { const r = await parseCSV(e.target.files[0]); setRows(r); };
  const importar = async () => { await api.post('/imports/counterparties', { companyId, rows }); setRows([]); await load(); };

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Contrapartes</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
        <option value="CUSTOMER">Cliente</option>
        <option value="SUPPLIER">Proveedor</option>
      </select>
      <input placeholder="CUIT/TaxId" value={form.taxId} onChange={e=>setForm({...form, taxId:e.target.value})} />
      <button onClick={crear}>Crear</button>
    </div>
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <input type="file" onChange={onFile} />
      <button onClick={importar} disabled={!rows.length}>Importar CSV</button>
      <span>{rows.length} filas listas</span>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Nombre</th><th>Tipo</th><th>TaxId</th></tr></thead>
      <tbody>{items.map((i:any)=><tr key={i.id}><td>{i.name}</td><td>{i.type}</td><td>{i.taxId||''}</td></tr>)}</tbody>
    </table>
  </div>;
}
