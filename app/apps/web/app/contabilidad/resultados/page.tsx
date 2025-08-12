'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { exportToExcel } from '@/lib/exportExcel';
import { api } from '@/lib/api';

export default function Resultados() {
  const { companyId } = useAuth();
  const [from, setFrom] = useState(new Date(new Date().getFullYear(),0,1).toISOString().slice(0,10));
  const [to, setTo] = useState(new Date().toISOString().slice(0,10));
  const [data, setData] = useState<any>(null);

  const cargar = async () => { const res = await api.get('/accounting/pl', { params: { companyId, from, to } }); setData(res.data); };
  const excel = () => {
    const rows = Object.entries(data?.byAccount||{}).map(([k,v])=> ({ Cuenta: k, Monto: v as number }));
    exportToExcel(rows, 'estado_resultados.xlsx');
  };

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Estado de Resultados</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
      <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
      <button onClick={cargar}>Calcular</button>
      {data && <><button onClick={excel}>Exportar Excel</button><button onClick={async()=>{ const res = await api.get('/reports/pl/pdf',{ params:{ companyId, from, to }, responseType:'blob' }); const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' })); const a=document.createElement('a'); a.href=url; a.download='estado_resultados.pdf'; a.click(); URL.revokeObjectURL(url); }}>Descargar PDF</button></>}
    </div>
    {data && <div>
      <p>Ingresos: ${data.revenue.toFixed(2)} — Gastos: ${data.expense.toFixed(2)} — <strong>Resultado: ${data.net.toFixed(2)}</strong></p>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th>Cuenta</th><th>Monto</th></tr></thead>
        <tbody>{Object.entries(data.byAccount).map(([k,v]:any)=> <tr key={k}><td>{k}</td><td>{(v as number).toFixed(2)}</td></tr>)}</tbody>
      </table>
    </div>}
  </div>;
}
