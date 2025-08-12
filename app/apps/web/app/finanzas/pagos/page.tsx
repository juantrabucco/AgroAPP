'use client';
import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function Pagos() {
  const { companyId } = useAuth();
  const { data: counterparties=[] } = useQuery({ queryKey: ['counterparties', companyId], queryFn: async()=> (await api.get('/counterparties', { params: { companyId } })).data, enabled: !!companyId });
  const suppliers = useMemo(()=> (counterparties as any[]).filter(c=>c.type==='SUPPLIER'), [counterparties]);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), counterpartyId: '', amount: 0 });

  const crear = async () => { await api.post('/settlements/payment', { ...form, companyId, method: 'CASH' }); alert('Pago registrado'); };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Pagos a Proveedores</h1>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:8 }}>
      <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
      <select value={form.counterpartyId} onChange={e=>setForm({...form, counterpartyId:e.target.value})}>
        <option value="">Proveedor</option>
        {suppliers.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="number" value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})} placeholder="Importe" />
      <button onClick={crear} disabled={!form.counterpartyId || !form.amount}>Registrar</button>
    </div>
  </div>;
}
