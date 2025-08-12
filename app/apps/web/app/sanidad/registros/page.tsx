'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { exportToExcel } from '@/lib/exportExcel';

export default function SanidadRegistros() {
  const { companyId } = useAuth();
  const [f, setF] = useState({ from: '', to: '', type: '', fieldId: '' });
  const { data: events=[] , refetch } = useQuery({
    queryKey: ['health-events', companyId, f],
    queryFn: async () => (await api.get('/health/events', { params: { companyId, ...f } })).data,
    enabled: !!companyId
  });

  const exportar = () => {
    const rows = (events as any[]).map(e=>({ Fecha: new Date(e.dueDate).toLocaleDateString(), Tipo: e.type, Campo: e.field?.name||'', Lote: e.lot?.name||'', Aplicaciones: e.applications.length }));
    exportToExcel(rows, 'sanidad_filtrado.xlsx');
  };

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Registros de Sanidad</h1>
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <input type="date" value={f.from} onChange={e=>setF({...f, from:e.target.value})} />
      <input type="date" value={f.to} onChange={e=>setF({...f, to:e.target.value})} />
      <input placeholder="Tipo (ej: VACUNACION)" value={f.type} onChange={e=>setF({...f, type:e.target.value})} />
      <input placeholder="Field ID" value={f.fieldId} onChange={e=>setF({...f, fieldId:e.target.value})} />
      <button onClick={()=>refetch()}>Filtrar</button>
      <button onClick={exportar}>Exportar filtrado</button>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Fecha</th><th>Tipo</th><th>Campo</th><th>Lote</th><th>Aplicaciones</th></tr></thead>
      <tbody>
        {(events as any[]).map((e:any)=>(
          <tr key={e.id}>
            <td>{new Date(e.dueDate).toLocaleDateString()}</td>
            <td>{e.type}</td>
            <td>{e.field?.name||''}</td>
            <td>{e.lot?.name||''}</td>
            <td>{e.applications.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
}
