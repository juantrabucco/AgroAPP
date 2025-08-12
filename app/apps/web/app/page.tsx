'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { companyId } = useAuth();
  const { data: animals } = useQuery({
    queryKey: ['animals', companyId],
    queryFn: async () => (await api.get('/animals', { params: { companyId } })).data,
    enabled: !!companyId
  });
  const { data: summary } = useQuery({
    queryKey: ['monthly', companyId],
    queryFn: async () => (await api.get('/commerce/summary/monthly', { params: { companyId } })).data,
    enabled: !!companyId
  });
  const chartData = (summary?.rows || []).map((r:any)=> ({ month: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][r.month-1], ventas: r.sales, compras: r.purchases }));

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h1>Dashboard</h1>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card title="Stock animales" value={(animals?.length ?? 0).toString()} />
        <Card title="Cumplimiento sanitario" value="82%" />
        <Card title="Ctas por cobrar (30d)" value="$ 1.2M" />
      </section>
      <section style={{ height: 300, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        <h3>Ventas vs Compras</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="ventas" fillOpacity={0.3} />
            <Area type="monotone" dataKey="compras" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
      <div style={{ color: '#666', fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
