'use client';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { exportToExcel } from '@/lib/exportExcel';

export default function ComercialResumen() {
  const { companyId } = useAuth();
  const { data: summary } = useQuery({
    queryKey: ['monthly', companyId],
    queryFn: async () => (await api.get('/commerce/summary/monthly', { params: { companyId } })).data,
    enabled: !!companyId
  });
  const rows = (summary?.rows || []).map((r:any)=> ({ Mes: r.month, Ventas: r.sales, Compras: r.purchases }));
  const data = (summary?.rows || []).map((r:any)=> ({ mes: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][r.month-1], Ventas: r.sales, Compras: r.purchases }));

  const excel = () => exportToExcel(rows, 'ventas_vs_compras.xlsx');

  return <div style={{ display:'grid', gap: 16 }}>
    <h1>Resumen Comercial</h1>
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={excel}>Exportar Excel</button>
    </div>
    <div style={{ height: 360, border:'1px solid #eee', borderRadius:12, padding:16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Ventas" />
          <Bar dataKey="Compras" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>;
}
