'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { exportToExcel } from '@/lib/exportExcel';
import { api } from '@/lib/api';

export default function Balance() {
  const { companyId } = useAuth();
  const [to, setTo] = useState(new Date().toISOString().slice(0,10));
  const [data, setData] = useState<any>(null);

  const cargar = async () => { const res = await api.get('/accounting/balance', { params: { companyId, to } }); setData(res.data); };
  const excel = () => {
    const rows = Object.entries(data?.byAccount||{}).map(([k,v])=> ({ Cuenta: k, Saldo: v as number }));
    exportToExcel(rows, 'balance.xlsx');
  };

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Balance</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
      <button onClick={cargar}>Calcular</button>
      {data && <><button onClick={excel}>Exportar Excel</button><button onClick={async()=>{ const res = await api.get('/reports/balance/pdf',{ params:{ companyId, to }, responseType:'blob' }); const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' })); const a=document.createElement('a'); a.href=url; a.download='balance.pdf'; a.click(); URL.revokeObjectURL(url); }}>Descargar PDF</button></>}
    </div>
    {data && <div>
      <p>Activos: ${data.assets.toFixed(2)} — Pasivos: ${data.liabilities.toFixed(2)} — Patrimonio: ${data.equity.toFixed(2)} — Check: {data.balanceCheck.toFixed(2)}</p>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th>Cuenta</th><th>Saldo</th></tr></thead>
        <tbody>{Object.entries(data.byAccount).map(([k,v]:any)=> <tr key={k}><td>{k}</td><td>{(v as number).toFixed(2)}</td></tr>)}</tbody>
      </table>
    </div>}
  </div>;
}
