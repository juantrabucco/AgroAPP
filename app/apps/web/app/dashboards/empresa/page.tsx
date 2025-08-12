'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DashboardEmpresa() {
  const { companyId } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: monthly } = useQuery({ queryKey:['monthly', companyId, year], queryFn: async()=> (await api.get('/commerce/summary/monthly', { params:{ companyId, year } })).data, enabled: !!companyId });
  const { data: animals=[] } = useQuery({ queryKey:['animals', companyId], queryFn: async()=> (await api.get('/animals', { params:{ companyId } })).data, enabled: !!companyId });
  const { data: events=[] } = useQuery({ queryKey:['health-events-kpi', companyId], queryFn: async()=> (await api.get('/health/events', { params:{ companyId } })).data, enabled: !!companyId });

  const chart = (monthly?.rows||[]).map((r:any)=> ({ mes: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][r.month-1], Ventas: r.sales, Compras: r.purchases }));
  const stock = [
    { name:'Bovinos', value: animals.filter((a:any)=>a.species==='BOVINE').length },
    { name:'Ovinos', value: animals.filter((a:any)=>a.species==='OVINE').length },
    { name:'Caprinos', value: animals.filter((a:any)=>a.species==='CAPRINE').length },
    { name:'Equinos', value: animals.filter((a:any)=>a.species==='EQUINE').length },
  ];
  const compl = Math.max(0, Math.min(100, Math.round((events.filter((e:any)=> e.applications?.length>0).length / (events.length||1))*100)));

  return <div style={{ display:'grid', gap:16 }}>
    <h1>Dashboard de Empresa</h1>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
      <Card k="Año" v={String(year)} />
      <Card k="Stock animales" v={String(animals.length)} />
      <Card k="Cumplimiento sanitario" v={`${compl}%`} />
      <Card k="Próx. vencimientos" v="7 días" />
    </div>
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <label>Año <input type="number" value={year} onChange={e=>setYear(Number(e.target.value)||year)} /></label>
    </div>
    <section style={{ height: 320, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
      <h3>Ventas vs Compras</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip /><Area type="monotone" dataKey="Ventas" fillOpacity={0.3} /><Area type="monotone" dataKey="Compras" fillOpacity={0.3} /></AreaChart>
      </ResponsiveContainer>
    </section>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
      <section style={{ height: 320, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        <h3>Stock por especie</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart><Pie dataKey="value" data={stock} label>{stock.map((_,i)=><Cell key={i} />)}</Pie><Legend /></PieChart>
        </ResponsiveContainer>
      </section>
      <section style={{ height: 320, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        <h3>Top métricas</h3>
        <ul>
          <li>Animales: {animals.length}</li>
          <li>Eventos sanitarios: {events.length}</li>
          <li>Aplicaciones realizadas: {events.filter((e:any)=> e.applications?.length>0).length}</li>
        </ul>
      </section>
    </div>
  </div>;
}

function Card({k,v}:{k:string;v:string}){
  return <div style={{ border:'1px solid #eee', borderRadius:12, padding:12 }}>
    <div style={{ fontSize:12, color:'#666' }}>{k}</div>
    <div style={{ fontSize:26, fontWeight:700 }}>{v}</div>
  </div>
}
