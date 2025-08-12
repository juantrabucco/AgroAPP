'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function useLists(companyId?: string) {
  const { data: counterparties=[] } = useQuery({
    queryKey: ['counterparties', companyId],
    queryFn: async () => (await api.get('/counterparties', { params: { companyId } })).data,
    enabled: !!companyId,
  });
  const { data: items=[] } = useQuery({
    queryKey: ['items', companyId],
    queryFn: async () => (await api.get('/items', { params: { companyId } })).data,
    enabled: !!companyId,
  });
  const customers = useMemo(() => (counterparties as any[]).filter(c => c.type === 'CUSTOMER'), [counterparties]);
  return { customers, items };
}

import { exportToExcel } from '@/lib/exportExcel';
export default function Ventas() {
  const { companyId } = useAuth();
  const qc = useQueryClient();
  const { customers, items } = useLists(companyId);
  const { data: sales=[] } = useQuery({
    queryKey: ['sales', companyId],
    queryFn: async () => (await api.get('/commerce/sales', { params: { companyId } })).data,
    enabled: !!companyId,
  });

  
  const [f, setF] = useState({ from: '', to: '', q: '' });
  const filtered = ( sales as any[] ).filter((r:any)=> {
    const d = new Date(r.date).toISOString().slice(0,10);
    const okFrom = !f.from || d >= f.from;
    const okTo = !f.to || d <= f.to;
    const hay = (r.counterparty?.name||'').toLowerCase().includes(f.q.toLowerCase());
    return okFrom && okTo && hay;
  });
  const exportar = () => {
    const rows = filtered.map((r:any)=>({ Fecha: new Date(r.date).toLocaleDateString(), Contraparte: r.counterparty?.name||'', Total: r.total }));
    exportToExcel(rows, 'ventas_filtrado.xlsx');
  };
  const [form, setForm] = useState<any>({ date: new Date().toISOString().slice(0,10), counterpartyId: '', payment: 'ACCOUNT', lines: [{ itemId: '', qty: 1, price: 0 }] });

  const addLine = () => setForm({ ...form, lines: [...form.lines, { itemId: '', qty: 1, price: 0 }] });
  const setLine = (i: number, patch: any) => setForm({ ...form, lines: form.lines.map((l:any,idx:number)=> idx===i?{...l,...patch}:l) });
  const total = form.lines.reduce((s:number,l:any)=> s + (Number(l.qty)||0) * (Number(l.price)||0), 0);

  const create = async () => {
    await api.post('/commerce/sales', { companyId, counterpartyId: form.counterpartyId, date: form.date, payment: form.payment, lines: form.lines });
    setForm({ date: new Date().toISOString().slice(0,10), counterpartyId: '', payment: 'ACCOUNT', lines: [{ itemId: '', qty: 1, price: 0 }] });
    qc.invalidateQueries({ queryKey: ['sales'] });
  };

  const pdf = async (id: string) => {
    const res = await api.get(`/reports/sale/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a'); a.href = url; a.download = `venta_${id}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  return <div style={{ display:'grid', gap: 16 }}>
    <h1>Ventas</h1>
    <div style={{ border:'1px solid #eee', borderRadius:12, padding:12 }}>
      <h3>Nueva venta</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, alignItems:'center' }}>
        <label>Fecha <input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} type="date" /></label>
        <label>Cliente
          <select value={form.counterpartyId} onChange={e=>setForm({...form, counterpartyId:e.target.value})}>
            <option value="">Seleccionar</option>
            {customers.map((c:any)=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Pago
          <select value={form.payment} onChange={e=>setForm({...form, payment:e.target.value})}>
            <option value="ACCOUNT">Cuenta Corriente</option>
            <option value="CASH">Contado</option>
          </select>
        </label>
        <div style={{ textAlign:'right', fontWeight:700 }}>Total: ${total.toFixed(2)}</div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', marginTop:8 }}>
        <thead><tr><th>Item</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead>
        <tbody>
          {form.lines.map((l:any, idx:number)=>(
            <tr key={idx}>
              <td>
                <select value={l.itemId} onChange={e=>setLine(idx,{ itemId:e.target.value })}>
                  <option value="">Seleccionar</option>
                  {items.map((it:any)=> <option key={it.id} value={it.id}>{it.name}</option>)}
                </select>
              </td>
              <td><input type="number" value={l.qty} onChange={e=>setLine(idx,{ qty:Number(e.target.value) })} /></td>
              <td><input type="number" value={l.price} onChange={e=>setLine(idx,{ price:Number(e.target.value) })} /></td>
              <td style={{ textAlign:'right' }}>{((Number(l.qty)||0)*(Number(l.price)||0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addLine}>+ Línea</button>
      <button onClick={create} disabled={!form.counterpartyId || !form.lines[0].itemId}>Crear venta</button>
    </div>

    <div>
      <h3>Ventas registradas</h3>
      <div style={ display:'flex', gap:8, alignItems:'center', margin:'8px 0' }>
        <input type='date' value={f.from} onChange={e=>setF({...f, from:e.target.value})} />
        <input type='date' value={f.to} onChange={e=>setF({...f, to:e.target.value})} />
        <input placeholder='Buscar por contraparte...' value={f.q} onChange={e=>setF({...f, q:e.target.value})} />
        <button onClick={exportar}>Exportar filtrado</button>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th>Fecha</th><th>Cliente</th><th>Total</th><th>PDF</th></tr></thead>
        <tbody>
          {(sales as any[]).map((s:any)=> (
            <tr key={s.id}>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.counterparty?.name||''}</td>
              <td>${s.total?.toFixed(2)||'0.00'}</td>
              <td><button onClick={()=>pdf(s.id)}>Descargar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
}
