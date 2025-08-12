'use client';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import { exportToExcel } from '@/lib/exportExcel';
import { api } from '@/lib/api';

export default function CuentasCorrientes() {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const res = await api.get('/accounting/statements', { params: { companyId } });
    setRows(res.data);
  };
  useEffect(() => { if (companyId) load(); }, [companyId]);

  const excel = () => exportToExcel(rows, 'cuentas_corrientes.xlsx');

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Cuentas Corrientes (Clientes/Proveedores)</h1>
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={load}>Refrescar</button>
      <button onClick={excel}>Exportar Excel</button>
    
      <div style={{ display:'flex', gap:8 }}>
        <input id="cpId" placeholder="Counterparty ID" />
        <input id="toDate" type="date" />
        <button onClick={async()=>{
          const cpId = (document.getElementById('cpId') as HTMLInputElement).value;
          const toDate = (document.getElementById('toDate') as HTMLInputElement).value || new Date().toISOString().slice(0,10);
          const res = await api.get(`/reports/statements/${cpId}/pdf`, { params: { companyId, to: toDate }, responseType: 'blob' });
          const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
          const a = document.createElement('a'); a.href = url; a.download = 'estado_cuenta.pdf'; a.click(); URL.revokeObjectURL(url);
        }}>Descargar estado (PDF)</button>
      </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Cuenta</th><th>Contraparte</th><th>Saldo</th><th>0-30</th><th>31-60</th><th>61-90</th><th>90+</th></tr></thead>
      <tbody>
        {rows.map((r:any, idx:number)=>(
          <tr key={idx}>
            <td>{r.accountCode} {r.accountName}</td>
            <td>{r.counterpartyId}</td>
            <td>{r.balance.toFixed(2)}</td>
            <td>{r.aging['0-30'].toFixed(2)}</td>
            <td>{r.aging['31-60'].toFixed(2)}</td>
            <td>{r.aging['61-90'].toFixed(2)}</td>
            <td>{r.aging['90+'].toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
}
