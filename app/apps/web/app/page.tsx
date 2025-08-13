'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LineStockChart } from '@/components/dashboard/LineStockChart';
import { BarSalesChart } from '@/components/dashboard/BarSalesChart';
import { MapLotsCard } from '@/components/dashboard/MapLotsCard';
import { AlertsCard } from '@/components/dashboard/AlertsCard';

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function Dashboard() {
  const { companyId } = useAuth();
  const { data: animals } = useQuery({

  const animals = useQuery({
    queryKey: ['animals', companyId],
    queryFn: async () => (await api.get('/animals', { params: { companyId } })).data,
    enabled: !!companyId
  });
  const { data: summary } = useQuery({
    queryKey: ['monthly', companyId],

  const monthly = useQuery({
    queryKey: ['commerce-monthly', companyId],
    queryFn: async () => (await api.get('/commerce/summary/monthly', { params: { companyId } })).data,
    enabled: !!companyId
  });
  const chartData = (summary?.rows || []).map((r:any)=> ({ month: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][r.month-1], ventas: r.sales, compras: r.purchases }));

  const kpis = useMemo(() => {
    const total = animals.data?.length ?? 0;
    // TODO: si el modelo expone categoría/estado, calcular real. Por ahora placeholders seguros:
    const terneros = animals.data ? Math.round(total * 0.26) : 0;
    const preneces = animals.data ? Math.round(total * 0.38) : 0;
    const mort = 2.4; // %
    const rows = monthly.data?.rows ?? [];
    const sumSales = rows.reduce((s: number, r: any) => s + (r.sales ?? 0), 0);
    const sumPurch = rows.reduce((s: number, r: any) => s + (r.purchases ?? 0), 0);
    const ganancias = Math.max(0, sumSales - sumPurch);
    const lluvias = 620; // TODO: reemplazar cuando exista endpoint/estación

    return { total, terneros, preneces, mort, ganancias, lluvias };
  }, [animals.data, monthly.data]);

  // Serie de ventas
  const ventas = useMemo(() => {
    const rows = monthly.data?.rows ?? [];
    return meses.map((m, i) => ({ mes: m, ventas: Math.round((rows[i]?.sales ?? 0) / 1000) })); // escala simple para visual
  }, [monthly.data]);

  // Evolución de stock (mock basado en total para demo)
  const stock = useMemo(() => {
    const base = kpis.total || 1200;
    const pts = [0.92, 0.95, 1.0, 1.05, 1.08, 1.03, 1.02, 1.06, 1.04, 1.05, 1.03, 1.07];
    return meses.map((m, i) => ({ mes: m, valor: Math.round(base * pts[i]) }));
  }, [kpis.total]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h1>Dashboard</h1>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card title="Stock animales" value={(animals?.length ?? 0).toString()} />
        <Card title="Cumplimiento sanitario" value="82%" />
        <Card title="Ctas por cobrar (30d)" value="$ 1.2M" />
    <div style={{ display:'grid', gap:16 }}>
      {/* KPIs */}
      <section style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(1, minmax(0,1fr))' } as any}>
        <div style={gridCols(1,2,3)}>
          <MetricCard title="Stock bovino total" value={fmtNum(kpis.total)} icon={<span>🐄</span>} />
          <MetricCard title="Terneros" value={fmtNum(kpis.terneros)} icon={<span>🐮</span>} />
          <MetricCard title="Preñeces" value={fmtNum(kpis.preneces)} icon={<span>✅</span>} />
          <MetricCard title="Mortandad" value={`${kpis.mort.toFixed(1)} %`} icon={<span>☠️</span>} />
          <MetricCard title="Ganancias" value={`${fmtCurrency(kpis.ganancias)} ARS`} icon={<span>💵</span>} />
          <MetricCard title="Lluvias acumuladas" value={`${fmtNum(kpis.lluvias)} mm`} icon={<span>🌧️</span>} />
        </div>
      </section>

      {/* Charts */}
      <section style={gridCols(1,1,2)}>
        <LineStockChart data={stock} />
        <BarSalesChart data={ventas} />
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

      {/* Mapa + Alertas */}
      <section style={gridCols(1,1,3)}>
        <div style={{ gridColumn:'span 2' }}><MapLotsCard /></div>
        <div><AlertsCard /></div>
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
function gridCols(sm:number, md:number, lg:number) {
  // CSS inline para responsive simple (fallback sin CSS Modules)
  const style: React.CSSProperties = { display:'grid', gap:16 };
  const cols = (n:number)=> `repeat(${n}, minmax(0,1fr))`;
  // por defecto 1 col
  style.gridTemplateColumns = cols(sm);
  // media-queries con container queries básicas usando inline <style> no son posibles;
  // el Shell ya tiene ancho máximo; aquí dejamos 1/2/3 col con JS si fuese necesario.
  return style;
}

function fmtNum(n:number) {
  return new Intl.NumberFormat('es-AR').format(n);
}
function fmtCurrency(n:number) {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}
